import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AutocompleteSuggestion, DestinationData } from "../types";


// Cache for autocomplete to save tokens/latency
const autocompleteCache: Record<string, AutocompleteSuggestion[]> = {};

export const getAutocompleteSuggestions = async (
  query: string
): Promise<AutocompleteSuggestion[]> => {
  if (!query || query.length < 3) return [];
  if (autocompleteCache[query]) return autocompleteCache[query];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 5 popular travel destinations that match or relate to the query: "${query}". Return only the name and location (Country).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              location: { type: Type.STRING }
            },
            required: ["name", "location"]
          }
        }
      }
    });

    const suggestions = JSON.parse(response.text || "[]");
    autocompleteCache[query] = suggestions;
    return suggestions;
  } catch (error) {
    console.error("Error fetching autocomplete:", error);
    return [];
  }
};

export const getDestinationDetails = async (
  destination: string
): Promise<DestinationData> => {
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
          },
          required: ["name", "description"]
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
        },
        required: ["lat", "lng"]
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
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a comprehensive travel guide for "${destination}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    return JSON.parse(response.text || "{}") as DestinationData;
  } catch (error) {
    console.error("Error fetching destination details:", error);
    throw new Error("Failed to load destination data.");
  }
};

/* =======================
   ITINERARY GENERATOR
======================= */

export const generateItinerary = async (
  destination: string,
  days: number
) => {
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
                },
                required: ["name", "note"]
              }
            },
            routeUrl: { type: Type.STRING }
          },
          required: [
            "dayNumber",
            "theme",
            "description",
            "places",
            "routeUrl"
          ]
        }
      }
    },
    required: ["tripName", "destination", "totalDays", "daysPlan"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
Create a ${days}-day travel itinerary for ${destination}.
Group nearby attractions per day.
Give a Google Maps directions link for each day.
Return ONLY valid JSON.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw new Error("Failed to generate itinerary.");
  }
};
