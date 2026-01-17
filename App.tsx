import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowLeft,
  Map as MapIcon,
  Compass
} from 'lucide-react';

import {
  getAutocompleteSuggestions,
  generateItinerary
} from './geminiService';

import {
  ViewState,
  DestinationData,
  AutocompleteSuggestion
} from './types';

import VoiceInput from './components/VoiceInput';
import HotelsSection from './components/HotelsSection';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [searchQuery, setSearchQuery] = useState('');
  const [destinationData, setDestinationData] =
    useState<DestinationData | null>(null);
  const [suggestions, setSuggestions] =
    useState<AutocompleteSuggestion[]>([]);

  /* AI SUMMARY */
  const [summary, setSummary] = useState<string[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  /* ITINERARY */
  const [days, setDays] = useState(3);
  const [itinerary, setItinerary] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  /* AUTOCOMPLETE (disabled backend safe) */
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 3 && view === ViewState.HOME) {
        const results = await getAutocompleteSuggestions(searchQuery);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, view]);

  /* SEARCH (FIX 2 – temp destination stub) */
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setSearchQuery(query);
    setSuggestions([]);
    setView(ViewState.LOADING);

    try {
      setDestinationData({
        name: query,
        country: "",
        region: "",
        shortDescription: "",
        aiSummaryPoints: [],
        touristPlaces: [],
        highlights: [],
        activities: [],
        coordinates: { lat: 0, lng: 0 }
      });

      setSummary([]);
      setItinerary(null);
      setView(ViewState.RESULT);
    } catch {
      alert('Something went wrong. Try again.');
      setView(ViewState.HOME);
    }
  };

  const resetHome = () => {
    setSearchQuery('');
    setDestinationData(null);
    setSummary([]);
    setItinerary(null);
    setView(ViewState.HOME);
  };

  /* AI SUMMARY (still works with stub) */
  const handleGenerateSummary = () => {
    if (!destinationData || summary.length > 0) return;

    setIsLoadingSummary(true);
    setTimeout(() => {
      setSummary([]);
      setIsLoadingSummary(false);
    }, 1200);
  };

  /* GENERATE ITINERARY (FIX 1 – adapter) */
  const handleGenerateItinerary = async () => {
    if (!destinationData) return;

    try {
      setIsGenerating(true);

      const raw = await generateItinerary(destinationData.name, days);

      const adapted = {
        daysPlan: raw.days.map((day: any, idx: number) => ({
          dayNumber: day.day || idx + 1,
          theme: `Day ${idx + 1} Exploration`,
          description: `Exploring ${destinationData.name}`,
          places: day.places.map((p: string) => ({
            name: p,
            note: "Recommended visit"
          })),
          routeUrl: `https://www.google.com/maps/dir/${encodeURIComponent(
            day.places.join(" / ")
          )}`
        }))
      };

      setItinerary(adapted);
    } catch {
      alert('Failed to generate itinerary');
    } finally {
      setIsGenerating(false);
    }
  };

  /* HOME */
  const renderHome = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-white rounded-2xl shadow-lg rotate-3">
            <Compass className="text-blue-600 w-12 h-12" />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">
          Travel Explorer
        </h1>
        <p className="text-slate-500 mb-8">Discover Your Next Adventure</p>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch(searchQuery)}
            placeholder="Where do you want to go?"
            className="w-full pl-12 pr-12 py-4 rounded-2xl shadow-xl"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <VoiceInput onTranscript={handleSearch} />
          </div>

          {suggestions.length > 0 && (
            <div className="absolute w-full bg-white rounded-xl shadow-2xl mt-2 z-20">
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onClick={() => handleSearch(`${s.name}, ${s.location}`)}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex gap-2"
                >
                  <MapPin size={16} />
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  /* RESULT */
  const renderResult = () => {
    if (!destinationData) return null;

    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <div className="fixed top-0 w-full bg-white border-b z-50 flex items-center px-4 py-3">
          <button onClick={resetHome}>
            <ArrowLeft />
          </button>
          <span className="mx-auto font-semibold">
            {destinationData.name}
          </span>
        </div>

        <div className="mt-[56px] max-w-3xl mx-auto px-4">

          {/* ITINERARY CONTROLS */}
          <div className="bg-white rounded-2xl shadow p-5 mb-6">
            <h3 className="font-bold mb-2">
              Generate Itinerary for {destinationData.name}
            </h3>

            <label className="text-sm font-medium">
              Days: {days}
            </label>

            <input
              type="range"
              min={1}
              max={12}
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="w-full mt-2"
            />

            <button
              onClick={handleGenerateItinerary}
              disabled={isGenerating}
              className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold"
            >
              {isGenerating ? 'Generating…' : 'Generate Itinerary'}
            </button>
          </div>

          {/* ITINERARY RESULT */}
          {itinerary && (
            <div className="space-y-6 mb-10">
              {itinerary.daysPlan.map((day: any) => (
                <div key={day.dayNumber} className="bg-white p-5 rounded-2xl shadow">
                  <h3 className="font-bold mb-1">
                    Day {day.dayNumber}: {day.theme}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {day.description}
                  </p>
                  <ul className="text-sm list-disc pl-5 mb-3">
                    {day.places.map((p: any, i: number) => (
                      <li key={i}>
                        <strong>{p.name}</strong> – {p.note}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={day.routeUrl}
                    target="_blank"
                    className="text-blue-600 font-medium text-sm"
                  >
                    Open Route in Google Maps →
                  </a>
                </div>
              ))}
            </div>
          )}

          <HotelsSection data={destinationData} />
        </div>
      </div>
    );
  };

  return (
    <>
      {view === ViewState.HOME && renderHome()}
      {view === ViewState.LOADING && (
        <div className="min-h-screen flex items-center justify-center">
          Loading…
        </div>
      )}
      {view === ViewState.RESULT && renderResult()}
    </>
  );
};

export default App;
