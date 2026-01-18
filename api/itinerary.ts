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
    return res.status(400).json({ error: "Missing data" });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(`
Create a ${days}-day travel itinerary for ${destination}.
Group nearby attractions per day.
Give Google Maps route links.
Return ONLY valid JSON in this format:

{
  "tripName": string,
  "destination": string,
  "totalDays": number,
  "daysPlan": [
    {
      "dayNumber": number,
      "theme": string,
      "description": string,
      "places": [{ "name": string, "note": string }],
      "routeUrl": string
    }
  ]
}
    `);

    const text = result.response.text();
    res.status(200).json(JSON.parse(text));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
