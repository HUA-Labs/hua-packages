/**
 * Client-side user settings management utility
 *
 * Queries and updates user personal settings via API.
 *
 * @remarks
 * Client-side only.
 * Use `user-settings-server.ts` on the server side.
 */

/**
 * Get the user's emotion flow count setting.
 */
export async function getUserEmotionFlowCount(userId: string): Promise<number> {
  try {
    const response = await fetch("/api/user/settings/emotion-flow");
    if (!response.ok) {
      throw new Error("Failed to fetch emotion flow setting");
    }

    const data = await response.json();
    return data.data?.emotionFlowCount || 6;
  } catch (error) {
    console.error("Failed to fetch emotion flow count setting:", error);
    return 6;
  }
}

/**
 * Save the user's emotion flow count setting.
 */
export async function setUserEmotionFlowCount(
  userId: string,
  count: number,
): Promise<void> {
  try {
    // Validate
    if (count < 4 || count > 6) {
      throw new Error("Emotion flow count must be between 4 and 6.");
    }

    const response = await fetch("/api/user/settings/emotion-flow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emotionFlowCount: count }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save emotion flow setting");
    }

    // Settings saved successfully
  } catch (error) {
    console.error("Failed to save emotion flow count setting:", error);
    throw error;
  }
}

/**
 * Returns the model setting for the given AI provider.
 *
 * TIP: Model options for initial free service (by cost):
 * 1. gemini-1.5-flash (Google): ₩2.21 (cheapest)
 * 2. gemini-2.0-flash (Google): ₩2.95 (currently in use)
 * 3. gpt-4o-mini (OpenAI): ₩4.43 (currently in use)
 * 4. gpt-5-mini (OpenAI): ₩12.84 (previously used)
 * 5. gemini-2.5-flash (Google): ₩15.95 (previously used)
 */
export function getModelForProvider(provider: string): string {
  switch (provider) {
    case "openai":
      return "gpt-5-mini"; // reasoning_effort: low (₩12.84, minimal reasoning for speed)
    case "gemini": // Google Gemini
      return "gemini-2.5-flash"; // reasoning (₩15.95, 15-20s) — default provider
    case "auto":
      return "gemini-2.5-flash"; // auto = Gemini preferred
    default:
      return "gemini-2.5-flash"; // default is also Gemini
  }
}

/**
 * Returns the provider for the given model name.
 * Used to automatically set the provider when selecting a model.
 *
 * @param model - Model name (e.g., 'gpt-5-mini', 'gemini-2.5-flash')
 * @returns Provider ('openai', 'gemini' (Google), 'auto')
 *
 * @example
 * ```typescript
 * const provider = getProviderForModel('gpt-5-mini');
 * console.log(provider); // "openai"
 *
 * const provider2 = getProviderForModel('gemini-2.5-flash');
 * console.log(provider2); // "gemini" (Google Gemini)
 * ```
 */
export function getProviderForModel(model: string): string {
  const normalizedModel = model.toLowerCase().trim();

  // OpenAI models
  if (normalizedModel.includes("gpt") || normalizedModel.includes("openai")) {
    return "openai";
  }

  // Google Gemini models
  if (normalizedModel.includes("gemini")) {
    return "gemini"; // Internally used as 'gemini', but actual provider is Google
  }

  // Auto selection
  if (normalizedModel === "auto") {
    return "auto";
  }

  // Default: OpenAI
  return "openai";
}

/**
 * Returns the API key for the given AI provider.
 */
export function getApiKeyForProvider(provider: string): string {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY || "";
    case "gemini":
      return process.env.GEMINI_API_KEY || "";
    case "auto":
      // Auto selection: Gemini preferred, fallback to OpenAI
      return process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || "";
    default:
      return process.env.GEMINI_API_KEY || "";
  }
}
