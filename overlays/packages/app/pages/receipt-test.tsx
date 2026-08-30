import { useState } from 'react';

export default function ReceiptTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch('/api/receipt-scan', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? `HTTP ${response.status}`);
      setResult(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: '2rem auto', padding: '0 1rem' }}>
      <h1>Receipt Vision Prototype</h1>
      <p>This page only analyzes a receipt. It does not modify the pantry.</p>

      <form onSubmit={submit}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          capture="environment"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button type="submit" disabled={!file || loading} style={{ marginLeft: '0.75rem' }}>
          {loading ? 'Analyzing…' : 'Analyze receipt'}
        </button>
      </form>

      {error && <pre style={{ whiteSpace: 'pre-wrap' }}>Error: {error}</pre>}
      {result && (
        <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', marginTop: '1rem' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
