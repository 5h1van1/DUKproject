import React from 'react';
import { motion } from 'framer-motion';
import { config } from '../config';
import Countdown from './Countdown';
import { Calendar, MapPin, Sparkles, ChevronDown } from 'lucide-react';

export default function Hero() {
  const scrollToRsvp = () => {
    const el = document.getElementById('rsvp');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-4 pb-12 sm:pb-16">
      {/* Background Image with Warm Festive & Turf Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={config.couple.heroImage}
          alt={`${config.couple.brideName} and ${config.couple.groomName}`}
          className="h-full w-full object-cover object-center scale-105 filter brightness-[0.78] contrast-[1.05]"
        />
        {/* Gradients blending wedding warmth and stadium turf vibes */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-slate-900/30" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-turf-950/40 to-slate-950/80" />
      </div>

      {/* Decorative Stadium Turf Accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-amber-400/10 blur-3xl pointer-events-none rounded-full" />

      {/* Hero Content Card */}
      <div className="relative z-10 mx-auto max-w-xl px-4 sm:px-6 text-center text-white flex flex-col items-center">
        
        {/* Pre-wedding Event Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-blue-500/20 px-3.5 py-1 backdrop-blur-md border border-amber-300/30 mb-4 shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin-slow" />
          <span className="text-xs font-semibold tracking-wider uppercase text-amber-200">
            The Pre-Wedding Face-Off
          </span>
        </motion.div>

        {/* Script Couple Names */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative mb-2"
        >
          <h1 className="font-script text-5xl sm:text-7xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-200 drop-shadow-lg leading-tight sm:leading-none">
            {config.couple.brideName} <span className="font-sans text-3xl sm:text-5xl font-light text-amber-300 mx-1">&</span> {config.couple.groomName}
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest text-amber-300/90 mt-1 font-semibold">
            {config.couple.brideNickname} <span className="text-slate-400">vs</span> {config.couple.groomNickname}
          </p>
        </motion.div>

        {/* Event Title */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mb-2 flex items-center gap-2"
        >
          <span>Turf Day 🏏</span>
          <span className="text-xs font-bold text-emerald-400 border border-emerald-500/40 bg-emerald-950/60 rounded px-2 py-0.5">
            BOX CRICKET & CHILL
          </span>
        </motion.h2>

        {/* Friendly Vibe Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-sm sm:text-base text-slate-200 max-w-md mb-5 leading-relaxed font-normal"
        >
          {config.couple.heroSubtitle}
        </motion.p>

        {/* Event Key Info Badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-6 text-xs text-slate-200"
        >
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/70 border border-white/15 px-3 py-1.5 backdrop-blur-md">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold text-white">Jan 28 or Jan 29</span>
            <span className="text-slate-400">|</span>
            <span>5:00 PM – 8:00 PM</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/70 border border-white/15 px-3 py-1.5 backdrop-blur-md">
            <MapPin className="h-3.5 w-3.5 text-rose-400" />
            <span className="font-medium text-white">{config.venue.shortLocation}</span>
          </div>
        </motion.div>

        {/* Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="w-full mb-6"
        >
          <Countdown />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs"
        >
          <button
            onClick={scrollToRsvp}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-turf-600 to-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/40 hover:from-emerald-600 hover:to-emerald-800 active:scale-98 transition-all"
          >
            <span>Pick Your Team & RSVP</span>
            <span className="text-base">🏏</span>
          </button>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="mt-8 flex flex-col items-center text-slate-400 text-xs animate-bounce-subtle">
          <span>Scroll to explore</span>
          <ChevronDown className="h-4 w-4 mt-0.5" />
        </div>
      </div>
    </section>
  );
}
