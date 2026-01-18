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

Structure:
{
  "tripName": string,
  "destination": string,
  "totalDays": number,
  "daysPlan": [
    {
      "dayNumber": number,
      "theme": string,
      "description": string,
      "places": [
        { "name": string, "note": string }
      ],
      "routeUrl": string
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const rawText = result.response.text();

    // 🔥 CRITICAL FIX — Gemini sometimes adds ```json fences
    const cleaned = rawText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);
  } catch (err: any) {
    console.error("Itinerary API error:", err);
    return res.status(500).json({
      error: "Failed to generate itinerary"
    });
  }
}
