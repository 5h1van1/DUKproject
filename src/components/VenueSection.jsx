import React from 'react';
import { config } from '../config';
import { MapPin, Navigation, Car, Sparkles, Compass } from 'lucide-react';

export default function VenueSection() {
  const handleOpenMaps = () => {
    window.open(config.venue.googleMapsUrl, '_blank');
  };

  return (
    <section id="venue" className="py-12 sm:py-16 px-4 sm:px-6 bg-white relative">
      <div className="mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-turf-100 text-turf-800 border border-turf-300 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass className="h-3.5 w-3.5 text-turf-600" />
            <span>Match Location</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            The Turf Arena
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Lush floodlit box turf, stadium dugout seating, and ample parking space.
          </p>
        </div>

        {/* Venue Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Details Column */}
          <div className="flex flex-col justify-between rounded-3xl bg-slate-900 p-6 sm:p-8 text-white shadow-xl">
            <div>
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 px-3 py-1 text-xs font-semibold mb-4 border border-emerald-400/30">
                <Sparkles className="h-3 w-3" />
                <span>Under The Floodlights</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {config.venue.name}
              </h3>

              <div className="mt-4 flex items-start gap-2.5 text-sm text-slate-300">
                <MapPin className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{config.venue.address}</p>
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-800 pt-5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>{config.venue.parkingNote}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">👟</span>
                  <span>{config.venue.dressCode}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={handleOpenMaps}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-turf-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-950/50 hover:from-emerald-600 hover:to-turf-700 active:scale-98 transition-all"
              >
                <Navigation className="h-4 w-4" />
                <span>Open in Google Maps</span>
              </button>
            </div>
          </div>

          {/* Visual Map / Graphic Column */}
          <div className="relative min-h-[280px] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-md flex flex-col justify-between p-4">
            {/* Visual Pitch Grid graphic */}
            <div className="absolute inset-0 turf-pattern opacity-95">
              {/* Pitch markings */}
              <div className="absolute inset-4 border-2 border-white/40 rounded-2xl flex items-center justify-center">
                <div className="w-24 h-24 border-2 border-white/40 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
                {/* Center Pitch */}
                <div className="absolute h-36 w-16 border border-amber-300/60 bg-amber-200/10 rounded flex flex-col justify-between items-center py-2">
                  <div className="w-8 h-1 bg-amber-400/80 rounded" />
                  <span className="text-[9px] font-bold text-amber-200 tracking-wider font-mono">PITCH</span>
                  <div className="w-8 h-1 bg-amber-400/80 rounded" />
                </div>
              </div>
            </div>

            {/* Floating Venue Tag */}
            <div className="relative z-10 self-start rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow-lg backdrop-blur-md flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{config.venue.shortLocation}</span>
            </div>

            <div className="relative z-10 self-end">
              <button
                onClick={handleOpenMaps}
                className="rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-slate-900 shadow-xl backdrop-blur-md hover:bg-white transition-all flex items-center gap-1.5 border border-slate-200"
              >
                <Navigation className="h-3.5 w-3.5 text-turf-700" />
                <span>Get Driving Directions</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
