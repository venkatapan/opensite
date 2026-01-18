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

  const { destination } = req.body;
  if (!destination) {
    return res.status(400).json({ error: "Missing destination" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(`
Generate a comprehensive travel guide for "${destination}".
Return ONLY valid JSON in this format:

{
  "name": string,
  "country": string,
  "region": string,
  "shortDescription": string,
  "aiSummaryPoints": string[],
  "touristPlaces": [{ "name": string, "description": string }],
  "highlights": [{ "name": string, "description": string }],
  "activities": string[],
  "coordinates": { "lat": number, "lng": number }
}
    `);

    const text = result.response.text();
    res.status(200).json(JSON.parse(text));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
