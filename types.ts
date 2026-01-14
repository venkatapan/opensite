export enum ViewState {
  HOME = 'HOME',
  LOADING = 'LOADING',
  RESULT = 'RESULT'
}

export interface AutocompleteSuggestion {
  name: string;
  location: string;
}

export interface DestinationData {
  name: string;
  country: string;
  region: string;
  shortDescription: string;

  aiSummaryPoints: string[];

  touristPlaces: {
    name: string;
    description: string;
  }[];

  highlights: {
    name: string;
    description: string;
  }[];

  activities: string[];

  coordinates: {
    lat: number;
    lng: number;
  };
}
