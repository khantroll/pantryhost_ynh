# Pantry Host for YunoHost — multi-AI GUI revision

This revision adds YunoHost GUI configuration for AI provider, key, model,
and OpenAI-compatible base URL both during installation and after installation.

The YunoHost GUI layer is ready for Anthropic, Gemini, Mistral, and
OpenAI-compatible providers.

**Application-side note:** the upstream Pantry Host source currently documents
Anthropic as the implemented AI backend. The additional choices become
functional when the application source is switched to a fork containing the
Gemini/Mistral/OpenAI-compatible provider adapters.
