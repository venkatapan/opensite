import { AutocompleteSuggestion, DestinationData } from "../types";

/* =======================
   AUTOCOMPLETE
======================= */

/**
 * Autocomplete backend inka add cheyyaledu.
 * Temporary ga empty suggestions.
 */
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

  // Backend already returns FINAL JSON shape
  return (await res.json()) as DestinationData;
};

/* =======================
   ITINERARY GENERATOR
======================= */

export const generateItinerary = async (
  destination: string,
  days: number
) => {
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

  // Backend already returns FINAL itinerary object
  return await res.json();
};
