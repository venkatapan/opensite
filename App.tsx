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
  getDestinationDetails,
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

  /* ✅ AI SUMMARY – Travel India style */
  const [summary, setSummary] = useState<string[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  /* ✅ ITINERARY */
  const [days, setDays] = useState(3);
  const [itinerary, setItinerary] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  /* AUTOCOMPLETE */
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

  /* SEARCH */
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setSearchQuery(query);
    setSuggestions([]);
    setView(ViewState.LOADING);

    try {
      const data = await getDestinationDetails(query);
      setDestinationData(data);
      setSummary([]);
      setIsLoadingSummary(false);
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

  /* AI SUMMARY */
  const handleGenerateSummary = () => {
    if (!destinationData || summary.length > 0) return;

    setIsLoadingSummary(true);
    setTimeout(() => {
      setSummary(destinationData.aiSummaryPoints);
      setIsLoadingSummary(false);
    }, 1200);
  };

  /* GENERATE ITINERARY */
  const handleGenerateItinerary = async () => {
    if (!destinationData) return;

    try {
      setIsGenerating(true);
      const data = await generateItinerary(destinationData.name, days);
      setItinerary(data);
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

          {/* AI SUMMARY */}
          <button
            onClick={handleGenerateSummary}
            disabled={isLoadingSummary}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg mb-6 ${isLoadingSummary
                ? 'bg-gray-200 text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
            <Sparkles size={18} className={isLoadingSummary ? 'animate-pulse' : ''} />
            {isLoadingSummary ? 'Thinking...' : 'AI Summary'}
          </button>

          {summary.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 mb-6">
              <h3 className="text-xl font-bold text-blue-800 mb-4">
                AI Insights
              </h3>
              <ul className="space-y-3">
                {summary.map((point, idx) => (
                  <li key={idx} className="text-blue-700">
                    • {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TOURIST PLACES */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">Tourist Places</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {destinationData.touristPlaces.map((p, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-xl shadow"
                >
                  <h4 className="font-semibold mb-1">
                    {p.name}
                  </h4>

                  <p className="text-sm text-slate-600 mb-2">
                    {p.description}
                  </p>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${p.name} ${destinationData.name}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm font-medium"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              ))}
            </div>
          </div>


          {/* EXPLORE MAP (UNCHANGED) */}
          <div className="bg-white rounded-2xl shadow mb-6 overflow-hidden">
            <div className="p-4 flex gap-2 items-center border-b">
              <MapIcon className="text-blue-500" />
              <h3 className="font-bold">Explore Map</h3>
            </div>

            <div className="w-full h-[420px]">
              <iframe
                width="100%"
                height="100%"
                loading="lazy"
                style={{ border: 0 }}
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  destinationData.touristPlaces
                    .map(p => `${p.name} ${destinationData.name}`)
                    .join(' | ')
                )}&z=12&output=embed`}
              />
            </div>
          </div>

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
