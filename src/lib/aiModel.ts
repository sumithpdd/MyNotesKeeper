/**
 * Single source of truth for the Gemini model used across the hub.
 *
 * Override with `GEMINI_MODEL` to change the model without a code change.
 *
 * **Finding the right ID:** the authority is the live Google API, not this file
 * and not the installed `@ai-sdk/google` package. That package pins a hardcoded
 * union of model IDs that goes stale between releases — it did not list
 * `gemini-3.6-flash` even while the API was actively recommending it. The union
 * ends in `(string & {})`, so any ID type-checks; an unknown or retired one
 * fails at request time with a message naming the current replacement.
 *
 * **On pinning:** a pinned model can be retired out from under you — that is
 * exactly what happened to `gemini-2.5-flash`. The floating aliases
 * (`gemini-flash-latest`, `gemini-pro-latest`) never go stale, at the cost of
 * the model changing without notice underneath a tool-calling path that writes
 * customer data. This file pins deliberately and leaves the alias available via
 * the env var.
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-3.6-flash';

/** Resolve the configured model, falling back to the pinned default. */
export function geminiModelId(): string {
  const configured = process.env.GEMINI_MODEL?.trim();
  return configured && configured.length > 0 ? configured : DEFAULT_GEMINI_MODEL;
}
