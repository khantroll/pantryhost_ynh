## AI configuration

The YunoHost install form and post-install configuration panel expose:

- provider: none, Anthropic, Gemini, Mistral, or OpenAI-compatible
- API key
- model
- OpenAI-compatible base URL

The values are stored in the app's `.env`. Saving the YunoHost configuration
panel reloads/restarts both Pantry Host services.

IMPORTANT: upstream Pantry Host currently documents Anthropic as its working
AI backend. Gemini, Mistral, and OpenAI-compatible require the corresponding
provider adapters in the Pantry Host application source. The YunoHost package
is GUI-ready for those adapters but does not fake support that upstream does
not yet implement.
