import type { VercelRequest, VercelResponse } from '@vercel/node';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const { destination, days } = req.body;

  if (!destination || !days) {
    return res.status(400).json({ error: 'Missing destination or days' });
  }

  const prompt = `
Create a ${days}-day travel itinerary for ${destination}.
Rules:
- Return ONLY valid JSON
- No markdown
- No explanations
- Structure exactly like below

{
  "tripName": "",
  "destination": "",
  "daysPlan": [
    {
      "dayNumber": 1,
      "theme": "",
      "description": "",
      "places": [
        { "name": "", "note": "" }
      ],
      "routeUrl": ""
    }
  ]
}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(500).json({ error: 'Empty Gemini response' });
    }

    const json = JSON.parse(text);
    return res.status(200).json(json);
  } catch (err: any) {
    return res.status(500).json({
      error: 'Gemini generation failed',
      details: err.message
    });
  }
}
