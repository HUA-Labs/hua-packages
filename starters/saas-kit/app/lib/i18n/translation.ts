// OpenAI client — lazily resolved at call time.
// Install `openai` and set OPENAI_API_KEY to enable AI translation features.

async function getOpenAIClient(): Promise<any> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not set. AI translation features require an OpenAI API key.",
    );
  }
  const { default: OpenAI } = await import("openai");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export type ContentType = "blog" | "announcement" | "notification";
export type TargetLanguage = "en" | "ja";

interface TranslationTone {
  description: string;
  examples?: string;
}

// Tone configuration per content type & language
const TONE_CONFIG: Record<
  ContentType,
  Record<TargetLanguage, TranslationTone>
> = {
  blog: {
    en: {
      description: `Journalistic, confident, and emotionally resonant tone. Write as if composing an original English essay — never produce "translated" text.

STYLE GUIDE:
- Short, rhythmic sentences. Break long Korean sentences into 2-3 English ones.
- Prefer concrete imagery over abstract statements.
- Use metaphors naturally — don't translate Korean metaphors literally.
- Contractions are fine (it's, we're, I'd).
- Address the reader directly when the original does.

ANTI-PATTERNS (never do these):
- "arbitrarily" → use "on a whim" or "casually"
- "I smile through many questions" → "When people ask why, I just smile"
- "with the intention of" → just state the intention directly
- "it is possible to" → "you can" or "we can"
- Never start sentences with "It is..." or "There is..." when avoidable
- Avoid passive voice unless the original deliberately uses it`,
      examples: `Korean: "~해도 될까요?" / "~하려고 합니다"
Good: natural English flow — "Here's..." / "Let me share..."
Bad: permission-seeking tone — "Is it okay to...?" / "I would like to..."

Korean: figurative/poetic expressions
Good: rewrite the metaphor in natural English imagery
Bad: translate the Korean metaphor word-for-word`,
    },
    ja: {
      description:
        "エモくて感性的なタメ口で翻訳してください。余韻を残す、柔らかい表現を使って、読者の心に響くように。日記やエッセイのような親しみやすい文体で。",
      examples: "例: 「素晴らしい一日でした」→「なんかすごくいい一日だったな」",
    },
  },
  announcement: {
    en: {
      description:
        "Professional but warm tone. Clear and friendly, like a helpful guide. Polite but not stiff.",
      examples:
        'Use "We\'re excited to..." or "You can now..." instead of corporate jargon.',
    },
    ja: {
      description:
        "丁寧語で温かみのある文体で翻訳してください。公式的だけど親しみやすく、読者に寄り添うような表現で。",
      examples:
        "例: 「お知らせいたします」「ご利用いただけます」など丁寧な表現を使用",
    },
  },
  notification: {
    en: {
      description:
        "Short, direct, and action-oriented. Like push notifications - clear and concise. Use active voice.",
      examples:
        'Use "New feature available" or "Check out..." instead of verbose explanations.',
    },
    ja: {
      description:
        "短く、直接的で、アクション指向の文体で翻訳してください。プッシュ通知のように明確で簡潔に。",
      examples:
        "例: 「新機能が追加されました」「ご確認ください」など簡潔な表現を使用",
    },
  },
};

// Default config per language
const LANGUAGE_CONFIG: Record<
  TargetLanguage,
  { name: string; nativeName: string }
> = {
  en: { name: "English", nativeName: "English" },
  ja: { name: "Japanese", nativeName: "日本語" },
};

export interface TranslateOptions {
  type: ContentType;
  targetLang: TargetLanguage;
}

export interface TranslationResult {
  title: string;
  content: string;
  excerpt?: string;
}

export interface TranslateInput {
  title: string;
  content: string;
  excerpt?: string;
}

/**
 * Translate content to the specified language with the given tone
 */
export async function translateContent(
  input: TranslateInput,
  options: TranslateOptions,
): Promise<TranslationResult> {
  const { type, targetLang } = options;
  const tone = TONE_CONFIG[type][targetLang];
  const langConfig = LANGUAGE_CONFIG[targetLang];

  const systemPrompt = `You are a professional translator specializing in ${langConfig.name} translation.

TARGET LANGUAGE: ${langConfig.nativeName}
CONTENT TYPE: ${type === "blog" ? "Blog post / Article" : "Announcement / Notice"}

TONE & STYLE:
${tone.description}

${tone.examples ? `EXAMPLES:\n${tone.examples}` : ""}

RULES:
- Translate naturally, not literally
- Keep the original meaning and emotion
- Adapt cultural references appropriately
- Maintain markdown formatting if present
- Return ONLY the translation, no explanations`;

  const userPrompt = `Translate the following content to ${langConfig.nativeName}:

---TITLE---
${input.title}

---CONTENT---
${input.content}

${input.excerpt ? `---EXCERPT---\n${input.excerpt}` : ""}

---

Respond in this exact JSON format:
{
  "title": "translated title",
  "content": "translated content",
  ${input.excerpt ? '"excerpt": "translated excerpt"' : ""}
}`;

  const client = await getOpenAIClient();

  const response = await client.chat.completions.create({
    model: "gpt-5", // prioritize translation quality
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    // gpt-5 only supports default temperature (1)
    response_format: { type: "json_object" },
  });

  const resultText = response.choices[0]?.message?.content || "{}";

  try {
    const result = JSON.parse(resultText);
    return {
      title: result.title || input.title,
      content: result.content || input.content,
      excerpt: result.excerpt || input.excerpt,
    };
  } catch {
    throw new Error("Failed to parse translation result");
  }
}

/**
 * Translate to all languages at once
 */
export async function translateToAllLanguages(
  input: TranslateInput,
  type: ContentType,
): Promise<{ en: TranslationResult; ja: TranslationResult }> {
  const [enResult, jaResult] = await Promise.all([
    translateContent(input, { type, targetLang: "en" }),
    translateContent(input, { type, targetLang: "ja" }),
  ]);

  return { en: enResult, ja: jaResult };
}

/**
 * Estimate token usage (for cost calculation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: Korean chars ~2 tokens each, English ~1 token per 4 chars
  const koreanChars = (text.match(/[\uAC00-\uD7AF]/g) || []).length;
  const otherChars = text.length - koreanChars;
  return Math.ceil(koreanChars * 2 + otherChars / 4);
}

/**
 * Polish Korean text
 */
export async function polishKorean(
  input: TranslateInput,
): Promise<TranslateInput> {
  const client = await getOpenAIClient();

  const systemPrompt = `You are a Korean editor. Polish the text to be natural and readable.

Rules:
- Preserve the original meaning and tone
- Smooth out sentences
- Fix typos and awkward expressions
- Keep markdown formatting
- Make minimal changes — only polish, don't rewrite`;

  const userPrompt = `Please polish the following text:

---TITLE---
${input.title}

---CONTENT---
${input.content}

${input.excerpt ? `---EXCERPT---\n${input.excerpt}` : ""}

---

Respond in JSON format:
{
  "title": "polished title",
  "content": "polished content",
  ${input.excerpt ? '"excerpt": "polished excerpt"' : ""}
}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.5,
    response_format: { type: "json_object" },
  });

  const resultText = response.choices[0]?.message?.content || "{}";

  try {
    const result = JSON.parse(resultText);
    return {
      title: result.title || input.title,
      content: result.content || input.content,
      excerpt: result.excerpt || input.excerpt,
    };
  } catch {
    return input;
  }
}

/**
 * Auto-generate tags
 */
export async function generateTags(
  content: string,
  existingTags: string[] = [],
): Promise<string[]> {
  if (existingTags.length > 0) {
    return existingTags; // Return as-is if tags already exist
  }

  const client = await getOpenAIClient();

  const systemPrompt = `You are a content tag generator. Analyze the topic and keywords in the text and generate appropriate tags.

Rules:
- Generate 3-5 tags
- Write in Korean
- Keep them short and clear (1-2 words)
- Combine general category + specific topic`;

  const userPrompt = `Generate appropriate tags for the following text:

${content.slice(0, 1000)}

---

Respond in JSON format:
{
  "tags": ["tag1", "tag2", "tag3"]
}`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const resultText = response.choices[0]?.message?.content || "{}";

  try {
    const result = JSON.parse(resultText);
    return result.tags || [];
  } catch {
    return [];
  }
}

/**
 * Full AI pipeline (polish + tags + translate)
 */
export interface AIPipelineOptions {
  polish?: boolean; // Polish Korean text
  generateTags?: boolean; // Auto-generate tags
  translate?: boolean; // Translate
}

export interface AIPipelineResult {
  // Polished Korean
  title: string;
  content: string;
  excerpt?: string;
  // Tags
  tags: string[];
  // Translations
  title_en?: string;
  content_en?: string;
  excerpt_en?: string;
  title_ja?: string;
  content_ja?: string;
  excerpt_ja?: string;
}

export async function runAIPipeline(
  input: TranslateInput,
  existingTags: string[] = [],
  options: AIPipelineOptions = {},
): Promise<AIPipelineResult> {
  const {
    polish = true,
    generateTags: genTags = true,
    translate = true,
  } = options;

  let processed = { ...input };
  let tags = existingTags;

  // 1. Polish
  if (polish) {
    processed = await polishKorean(processed);
  }

  // 2. Generate tags
  if (genTags && tags.length === 0) {
    tags = await generateTags(processed.content);
  }

  // 3. Translate
  let translations = { en: processed, ja: processed };
  if (translate) {
    translations = await translateToAllLanguages(processed, "blog");
  }

  return {
    title: processed.title,
    content: processed.content,
    excerpt: processed.excerpt,
    tags,
    title_en: translations.en.title,
    content_en: translations.en.content,
    excerpt_en: translations.en.excerpt,
    title_ja: translations.ja.title,
    content_ja: translations.ja.content,
    excerpt_ja: translations.ja.excerpt,
  };
}
