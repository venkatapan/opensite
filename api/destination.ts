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

  const { destination } = req.body;
  if (!destination) {
    return res.status(400).json({ error: "Missing destination" });
  }

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING },
      country: { type: Type.STRING },
      region: { type: Type.STRING },
      shortDescription: { type: Type.STRING },
      aiSummaryPoints: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      touristPlaces: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["name", "description"]
        }
      },
      highlights: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING }
          }
        }
      },
      activities: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      coordinates: {
        type: Type.OBJECT,
        properties: {
          lat: { type: Type.NUMBER },
          lng: { type: Type.NUMBER }
        }
      }
    },
    required: [
      "name",
      "country",
      "region",
      "shortDescription",
      "aiSummaryPoints",
      "touristPlaces",
      "highlights",
      "activities",
      "coordinates"
    ]
  };

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: `Generate a comprehensive travel guide for "${destination}".`,
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
