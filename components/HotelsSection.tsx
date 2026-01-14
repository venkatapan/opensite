import React from 'react';
import { ExternalLink, Hotel } from 'lucide-react';
import { DestinationData, HotelProvider } from '../types';

interface HotelsSectionProps {
  data: DestinationData;
}

const HotelsSection: React.FC<HotelsSectionProps> = ({ data }) => {
  const getProviders = (country: string, region: string): HotelProvider[] => {
    const providers: HotelProvider[] = [];
    const normalizedCountry = country.toLowerCase();
    const normalizedRegion = region.toLowerCase();

    // Global
    providers.push({ name: 'Booking.com', url: 'https://www.booking.com', icon: '🌍' });

    if (normalizedCountry.includes('india')) {
      providers.unshift({ name: 'OYO Rooms', url: 'https://www.oyorooms.com', icon: '🇮🇳' });
      providers.push({ name: 'MakeMyTrip', url: 'https://www.makemytrip.com/hotels', icon: '🇮🇳' });
    } else if (normalizedRegion.includes('europe')) {
      providers.unshift({ name: 'Hostelworld', url: 'https://www.hostelworld.com', icon: '🇪🇺' });
    } else if (normalizedRegion.includes('north america') || normalizedCountry.includes('usa') || normalizedCountry.includes('canada')) {
      providers.unshift({ name: 'Expedia', url: 'https://www.expedia.com', icon: '🇺🇸' });
      providers.push({ name: 'Hotels.com', url: 'https://www.hotels.com', icon: '🏨' });
    } else if (normalizedRegion.includes('asia')) {
      providers.unshift({ name: 'Agoda', url: 'https://www.agoda.com', icon: '🌏' });
    }

    return providers.slice(0, 3); // Return top 3
  };

  const providers = getProviders(data.country, data.region);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Hotel className="text-blue-600" size={24} />
        <h2 className="text-xl font-bold text-slate-800">Stay in {data.name}</h2>
      </div>
      <p className="text-slate-500 mb-4 text-sm">Best booking options for this region</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {providers.map((provider) => (
          <a
            key={provider.name}
            href={`${provider.url}/search?ss=${encodeURIComponent(data.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" role="img" aria-label={provider.name}>{provider.icon}</span>
              <span className="font-semibold text-slate-700 group-hover:text-blue-700">{provider.name}</span>
            </div>
            <ExternalLink size={16} className="text-slate-400 group-hover:text-blue-500" />
          </a>
        ))}
      </div>
    </div>
  );
};

export default HotelsSection;
