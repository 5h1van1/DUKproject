import React from 'react';
import { motion } from 'framer-motion';
import { config } from '../config';
import { Shirt, Trophy, Flame, Cake, Utensils, Sparkles, Clock } from 'lucide-react';

const iconMap = {
  Shirt: Shirt,
  Trophy: Trophy,
  Flame: Flame,
  Cake: Cake,
  Utensils: Utensils,
  Sparkles: Sparkles,
};

export default function Timeline() {
  // Construct the active timeline items, inserting surprise segment if enabled in config
  const items = [...config.timeline];

  if (config.surpriseSegment && config.surpriseSegment.enabled) {
    const insertIndex = config.surpriseSegment.positionAfterStep || 3;
    items.splice(insertIndex, 0, {
      step: '★',
      time: config.surpriseSegment.time,
      title: config.surpriseSegment.title,
      description: config.surpriseSegment.description,
      icon: config.surpriseSegment.icon || 'Sparkles',
      isSurprise: true,
      highlight: true,
    });
  }

  return (
    <section id="timeline" className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Turf Field Lines Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40 -translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/40 rounded-full" />
      </div>

      <div className="mx-auto max-w-3xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-turf-900/80 text-emerald-300 border border-emerald-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>Evening Schedule</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Plan of the Evening
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
            From jersey toss to final overs and dinner — here is how the magic unfolds under the floodlights.
          </p>
        </div>

        {/* Timeline Items */}
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:via-amber-400 before:to-emerald-500">
          {items.map((item, index) => {
            const IconComponent = iconMap[item.icon] || Trophy;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative group"
              >
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-6 sm:-left-8 top-1.5 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 transition-transform group-hover:scale-110 ${
                    item.isSurprise
                      ? 'bg-amber-500 border-amber-300 text-slate-950 animate-pulse'
                      : item.highlight
                      ? 'bg-emerald-500 border-emerald-300 text-slate-950'
                      : 'bg-slate-800 border-slate-600 text-slate-200'
                  }`}
                >
                  <IconComponent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>

                {/* Content Box */}
                <div
                  className={`rounded-2xl p-4 sm:p-5 transition-all ${
                    item.isSurprise
                      ? 'bg-gradient-to-r from-amber-950/70 via-slate-800 to-amber-950/70 border border-amber-400/50 shadow-lg shadow-amber-950/50'
                      : item.highlight
                      ? 'bg-gradient-to-r from-turf-950/90 to-slate-800/90 border border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                      : 'bg-slate-800/70 border border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
                        item.isSurprise
                          ? 'bg-amber-400 text-slate-900 font-extrabold'
                          : 'bg-slate-700 text-amber-300'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </span>

                    {item.highlight && !item.isSurprise && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                        ⚡ Main Match
                      </span>
                    )}

                    {item.isSurprise && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-400/50">
                        ✨ Surprise Act
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
