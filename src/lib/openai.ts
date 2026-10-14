import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    response_format: "url",
  });

  const url = response.data?.[0]?.url;
  if (!url) throw new Error("No image URL returned from DALL-E");
  return url;
}

export async function scoreImageSimilarity(
  masterImageUrl: string,
  generatedImageUrl: string
): Promise<number> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a visual similarity judge for a prompt battle game. Compare these two images and return ONLY a number from 0 to 100 representing how visually similar they are. Consider composition, colors, objects, style, and overall feel. 0 = completely different, 100 = identical. Return only the number, nothing else.`,
          },
          {
            type: "image_url",
            image_url: { url: masterImageUrl, detail: "low" },
          },
          {
            type: "image_url",
            image_url: { url: generatedImageUrl, detail: "low" },
          },
        ],
      },
    ],
    max_tokens: 10,
  });

  const text = response.choices[0].message.content?.trim() ?? "0";
  const score = parseFloat(text);
  return isNaN(score) ? 0 : Math.min(100, Math.max(0, score));
}
