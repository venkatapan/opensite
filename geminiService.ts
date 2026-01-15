import { AutocompleteSuggestion, DestinationData } from "../types";

/* =======================
   AUTOCOMPLETE
======================= */

// Cache remains exactly the same
const autocompleteCache: Record<string, AutocompleteSuggestion[]> = {};

export const getAutocompleteSuggestions = async (
  query: string
): Promise<AutocompleteSuggestion[]> => {
  return [];
};


/* =======================
   DESTINATION DETAILS
======================= */

export const getDestinationDetails = async (
  destination: string
): Promise<DestinationData> => {
  try {
    const res = await fetch("/api/destination", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ destination })
    });

    if (!res.ok) {
      throw new Error("Destination API failed");
    }

    return (await res.json()) as DestinationData;
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
  try {
    const res = await fetch("/api/itinerary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ destination, days })
    });

    if (!res.ok) {
      throw new Error("Itinerary API failed");
    }

    const data = await res.json();

    // Backend returns Gemini JSON as text → parse it
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw new Error("Failed to generate itinerary.");
  }
};
