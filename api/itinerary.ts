import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI, Schema, Type } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      tripName: { type: Type.STRING },
      destination: { type: Type.STRING },
      totalDays: { type: Type.NUMBER },
      daysPlan: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            dayNumber: { type: Type.NUMBER },
            theme: { type: Type.STRING },
            description: { type: Type.STRING },
            places: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  note: { type: Type.STRING }
                }
              }
            },
            routeUrl: { type: Type.STRING }
          }
        }
      }
    },
    required: ["tripName", "destination", "totalDays", "daysPlan"]
  };

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: `
Create a ${days}-day travel itinerary for ${destination}.
Group nearby attractions per day.
Provide Google Maps route links.
Return ONLY valid JSON.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    res.status(200).json(JSON.parse(result.response.text()));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
