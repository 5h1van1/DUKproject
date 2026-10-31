import React from 'react';
import { motion } from 'framer-motion';
import { config } from '../config';
import { Crown, Zap, Flame, Users, Shirt } from 'lucide-react';

export default function FaceOffBanner({ rsvps = [], onSelectTeam }) {
  const brideCount = rsvps.filter((r) => r.team === 'bride').length;
  const groomCount = rsvps.filter((r) => r.team === 'groom').length;
  const totalCount = brideCount + groomCount;

  const bridePercentage = totalCount > 0 ? Math.round((brideCount / totalCount) * 100) : 50;
  const groomPercentage = 100 - bridePercentage;

  const handleTeamClick = (teamId) => {
    if (onSelectTeam) {
      onSelectTeam(teamId);
    }
    const rsvpEl = document.getElementById('rsvp');
    if (rsvpEl) {
      rsvpEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="faceoff" className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-b from-festive-cream via-white to-festive-cream">
      <div className="mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
            <Flame className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
            <span>The Great Turf Rivalry</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Team Bride <span className="text-amber-500 font-serif italic font-light">vs</span> Team Groom
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Whose side are you backing? Tap your squad to join the lineup. Live squad counter updates automatically!
          </p>
        </div>

        {/* Live Tug-of-War Percentage Bar */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-2">
            <div className="flex items-center gap-1.5 text-rose-600">
              <Crown className="h-4 w-4" />
              <span>{config.teams.bride.name} ({brideCount})</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 font-medium">
              LIVE LINEUP
            </div>
            <div className="flex items-center gap-1.5 text-blue-600">
              <span>({groomCount}) {config.teams.groom.name}</span>
              <Zap className="h-4 w-4" />
            </div>
          </div>

          {/* Tug Bar */}
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 flex p-0.5 shadow-inner">
            <motion.div
              className="h-full rounded-l-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-700 relative"
              style={{ width: `${bridePercentage}%` }}
            >
              {bridePercentage > 15 && (
                <span className="absolute inset-y-0 right-2 flex items-center text-[10px] font-bold text-white drop-shadow">
                  {bridePercentage}%
                </span>
              )}
            </motion.div>
            <motion.div
              className="h-full rounded-r-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 relative"
              style={{ width: `${groomPercentage}%` }}
            >
              {groomPercentage > 15 && (
                <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold text-white drop-shadow">
                  {groomPercentage}%
                </span>
              )}
            </motion.div>
          </div>
          <div className="mt-2 text-center text-[11px] text-slate-400">
            {brideCount === groomCount ? (
              <span>Scores are tied! Next RSVP breaks the deadlock.</span>
            ) : brideCount > groomCount ? (
              <span className="text-rose-600 font-semibold">Team Bride is leading the squad draft! 🔥</span>
            ) : (
              <span className="text-blue-600 font-semibold">Team Groom is dominating the turf numbers! ⚡</span>
            )}
          </div>
        </div>

        {/* Team Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Team Bride Card */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => handleTeamClick('bride')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-rose-200 bg-gradient-to-b from-rose-50/70 via-white to-rose-50/40 p-5 shadow-md shadow-rose-900/5 transition-all hover:border-rose-400 hover:shadow-lg"
          >
            <div className="absolute top-0 right-0 rounded-bl-xl bg-gradient-to-r from-rose-500 to-pink-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
              {config.teams.bride.captain}
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-rose-950 flex items-center gap-1.5">
                  {config.teams.bride.name}
                </h3>
                <p className="text-xs font-medium text-rose-700">
                  {config.teams.bride.subtitle}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 italic mb-4">
              "{config.teams.bride.motto}"
            </p>

            <div className="space-y-1.5 border-t border-rose-100 pt-3 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500">
                  <Shirt className="h-3.5 w-3.5 text-rose-500" />
                  Jersey Theme:
                </span>
                <span className="font-semibold text-rose-800">{config.teams.bride.colorName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500">
                  <Users className="h-3.5 w-3.5 text-rose-500" />
                  Joined Players:
                </span>
                <span className="font-bold text-rose-600 text-sm">{brideCount} Confirmed</span>
              </div>
            </div>

            <button className="mt-4 w-full rounded-xl bg-rose-600 py-2.5 text-center text-xs font-bold text-white shadow-sm transition-colors group-hover:bg-rose-700">
              Join Team Bride →
            </button>
          </motion.div>

          {/* Team Groom Card */}
          <motion.div
            whileHover={{ y: -3 }}
            onClick={() => handleTeamClick('groom')}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/70 via-white to-blue-50/40 p-5 shadow-md shadow-blue-900/5 transition-all hover:border-blue-400 hover:shadow-lg"
          >
            <div className="absolute top-0 right-0 rounded-bl-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
              {config.teams.groom.captain}
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-blue-950 flex items-center gap-1.5">
                  {config.teams.groom.name}
                </h3>
                <p className="text-xs font-medium text-blue-700">
                  {config.teams.groom.subtitle}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 italic mb-4">
              "{config.teams.groom.motto}"
            </p>

            <div className="space-y-1.5 border-t border-blue-100 pt-3 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500">
                  <Shirt className="h-3.5 w-3.5 text-blue-500" />
                  Jersey Theme:
                </span>
                <span className="font-semibold text-blue-800">{config.teams.groom.colorName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-slate-500">
                  <Users className="h-3.5 w-3.5 text-blue-500" />
                  Joined Players:
                </span>
                <span className="font-bold text-blue-600 text-sm">{groomCount} Confirmed</span>
              </div>
            </div>

            <button className="mt-4 w-full rounded-xl bg-blue-600 py-2.5 text-center text-xs font-bold text-white shadow-sm transition-colors group-hover:bg-blue-700">
              Join Team Groom →
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
