/**
 * Single source of truth for the Gemini model used across the hub.
 *
 * Default is a **GA** model rather than a preview: previews can change or be
 * withdrawn without notice, which is a poor property for the tool-calling path
 * that writes customer data. Newer preview models (e.g. the `gemini-3*-preview`
 * family declared by `@ai-sdk/google`) can be adopted without a code change by
 * setting `GEMINI_MODEL`.
 *
 * Valid IDs are enumerated by the installed `@ai-sdk/google` package — check
 * there before setting the env var rather than guessing a name.
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

/** Resolve the configured model, falling back to the GA default. */
export function geminiModelId(): string {
  const configured = process.env.GEMINI_MODEL?.trim();
  return configured && configured.length > 0 ? configured : DEFAULT_GEMINI_MODEL;
}
