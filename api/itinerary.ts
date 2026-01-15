import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not set" });
  }

  const { destination, days } = req.body;

  if (!destination || !days) {
    return res.status(400).json({
      error: "Missing destination or days"
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
Create a ${days}-day travel itinerary for ${destination}.

Rules:
- Return ONLY valid JSON
- No markdown
- No explanation
- Structure:
{
  "destination": string,
  "days": [
    {
      "day": number,
      "places": string[]
    }
  ]
}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({
      success: true,
      data: text
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || "Gemini error"
    });
  }
}
