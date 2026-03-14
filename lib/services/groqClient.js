import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateGroqResponse(prompt) {
  if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is missing");
    return null;
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI assistant for PriceWiser. Return only valid JSON. No markdown, no extra text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    return JSON.parse(content);
  } catch (error) {
    console.error("Groq AI Error:", error);
    return null;
  }
}
