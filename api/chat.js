import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "messages must be a non-empty array",
      });
    }

    if (messages.length > 20) {
      return res.status(400).json({
        error: "Too many messages",
      });
    }

    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [
        {
          text: String(message.content || ""),
        },
      ],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
    });

    return res.status(200).json({
      reply: response.text,
    });
  } catch (error) {
    console.error(
      "NOORA Gateway error:",
      error?.message || "Unknown error"
    );

    return res.status(500).json({
      error: "NOORA Gateway could not process the request",
    });
  }
}
