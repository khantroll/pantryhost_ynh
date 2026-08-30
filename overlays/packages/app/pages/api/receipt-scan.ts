import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File } from 'formidable';
import { promises as fs } from 'fs';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: false,
  },
};

type ReceiptItem = {
  receiptText: string;
  name: string;
  brand: string | null;
  quantity: number | null;
  itemSize: number | null;
  itemSizeUnit: string | null;
  category: string | null;
  confidence: number;
  excluded: boolean;
  excludeReason: string | null;
  needsReview: boolean;
};

type ReceiptResult = {
  store: string | null;
  purchaseDate: string | null;
  currency: string | null;
  items: ReceiptItem[];
};

const nullableString = { type: 'string', nullable: true };
const nullableNumber = { type: 'number', nullable: true };

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    store: nullableString,
    purchaseDate: nullableString,
    currency: nullableString,
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          receiptText: { type: 'string' },
          name: { type: 'string' },
          brand: nullableString,
          quantity: nullableNumber,
          itemSize: nullableNumber,
          itemSizeUnit: nullableString,
          category: nullableString,
          confidence: { type: 'number' },
          excluded: { type: 'boolean' },
          excludeReason: nullableString,
          needsReview: { type: 'boolean' },
        },
        required: [
          'receiptText', 'name', 'brand', 'quantity', 'itemSize', 'itemSizeUnit',
          'category', 'confidence', 'excluded', 'excludeReason', 'needsReview',
        ],
      },
    },
  },
  required: ['store', 'purchaseDate', 'currency', 'items'],
};

const PROMPT = `Analyze this grocery receipt and return only structured data matching the provided JSON schema.

Rules:
- Include every purchased line item you can identify.
- Convert retailer abbreviations into clear household product names when reasonably confident.
- Preserve the original receipt line in receiptText.
- quantity means number of packages/items purchased, not package size.
- itemSize/itemSizeUnit describe package size when visible or strongly inferable from the receipt text.
- category should be a simple pantry-friendly category such as Dairy, Produce, Meat, Frozen, Bakery, Pantry, Beverage, Household, Pet, Personal Care, or Other.
- Set excluded=true for taxes, discounts, coupons, payment lines, subtotals/totals, deposits/fees, and other non-purchased lines.
- Household, pet, and personal-care purchases are real purchases; do not exclude them just because they are not food.
- If an item name or quantity is uncertain, set needsReview=true and lower confidence.
- confidence must be between 0 and 1.
- Never invent UPCs, quantities, sizes, brands, or prices that are not visible or reasonably inferable.
- Use null when a field cannot be determined.
- purchaseDate should be YYYY-MM-DD when visible, otherwise null.`;

function getGeminiText(payload: any): string | null {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;
  const textPart = parts.find((p: any) => typeof p?.text === 'string');
  return textPart?.text ?? null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const provider = (process.env.AI_PROVIDER ?? '').toLowerCase();
  if (provider !== 'gemini') {
    return res.status(400).json({ error: 'Receipt scanning prototype currently requires AI_PROVIDER=gemini' });
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'AI_API_KEY is not configured' });

  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 12 * 1024 * 1024,
    multiples: false,
  });

  return new Promise<void>((resolve) => {
    form.parse(req, async (err, _fields, files) => {
      let file: File | undefined;
      try {
        if (err) {
          res.status(400).json({ error: err.message });
          return resolve();
        }

        const field = files.file;
        file = Array.isArray(field) ? field[0] : field;
        if (!file) {
          res.status(400).json({ error: 'No receipt image uploaded' });
          return resolve();
        }

        const input = await fs.readFile(file.filepath);
        const optimized = await sharp(input)
          .rotate()
          .resize({ width: 1800, height: 2800, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 84, mozjpeg: true })
          .toBuffer();

        const model = process.env.AI_MODEL?.trim() || 'gemini-2.5-flash';
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 45_000);
        let response: Response;
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            signal: controller.signal,
            body: JSON.stringify({
              contents: [{
                role: 'user',
                parts: [
                  { text: PROMPT },
                  { inlineData: { mimeType: 'image/jpeg', data: optimized.toString('base64') } },
                ],
              }],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: 'application/json',
                responseSchema: RESPONSE_SCHEMA,
              },
            }),
          });
        } finally {
          clearTimeout(timeout);
        }

        const raw = await response.text();
        if (!response.ok) {
          console.error('[receipt-scan] Gemini error:', response.status, raw);
          res.status(502).json({ error: `Gemini request failed (${response.status})` });
          return resolve();
        }

        let geminiPayload: any;
        try {
          geminiPayload = JSON.parse(raw);
        } catch {
          res.status(502).json({ error: 'Gemini returned an invalid API response' });
          return resolve();
        }

        const text = getGeminiText(geminiPayload);
        if (!text) {
          res.status(502).json({ error: 'Gemini returned no structured receipt data' });
          return resolve();
        }

        let parsed: ReceiptResult;
        try {
          parsed = JSON.parse(text) as ReceiptResult;
        } catch {
          console.error('[receipt-scan] Could not parse Gemini JSON:', text);
          res.status(502).json({ error: 'Gemini returned malformed receipt JSON' });
          return resolve();
        }

        res.status(200).json(parsed);
        resolve();
      } catch (error) {
        console.error('[receipt-scan] Failed:', error);
        res.status(500).json({ error: (error as Error).message || 'Receipt scan failed' });
        resolve();
      } finally {
        if (file?.filepath) await fs.unlink(file.filepath).catch(() => {});
      }
    });
  });
}
