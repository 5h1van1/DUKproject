import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { config } from '../config';
import { generateIcsCalendar, getGoogleCalendarUrl } from '../services/calendar';
import { CheckCircle2, Calendar, Share2, Download, Edit3, X, MapPin, Shirt, Trophy } from 'lucide-react';

export default function RsvpSuccessModal({ isOpen, onClose, rsvpData, onEditAgain }) {
  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti cannon!
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      function fire(particleRatio, opts) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });
      fire(0.2, {
        spread: 60,
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [isOpen]);

  if (!isOpen || !rsvpData) return null;

  const selectedDateObj = config.dates.find((d) => d.id === rsvpData.preferredDate) || config.dates[0];
  const isBride = rsvpData.team === 'bride';
  const teamConfig = isBride ? config.teams.bride : config.teams.groom;

  const handleDownloadIcs = () => {
    generateIcsCalendar({
      title: `${config.couple.brideName} & ${config.couple.groomName}: Turf Day 🏏`,
      description: `Pre-Wedding Turf Day celebration!\nSquad: ${teamConfig.name}\nJersey: ${rsvpData.needsJersey ? rsvpData.jerseySize : 'None'}\n\nWear sneakers & athletic attire!`,
      location: `${config.venue.name}, ${config.venue.address}`,
      dateId: rsvpData.preferredDate,
      startTime: '17:00',
      endTime: '20:00',
    });
  };

  const handleGoogleCalendar = () => {
    const url = getGoogleCalendarUrl({
      title: `${config.couple.brideName} & ${config.couple.groomName}: Turf Day 🏏`,
      description: `Pre-Wedding Turf Day celebration!\nSquad: ${teamConfig.name}\nJersey: ${rsvpData.needsJersey ? rsvpData.jerseySize : 'None'}`,
      location: `${config.venue.name}, ${config.venue.address}`,
      dateId: rsvpData.preferredDate,
      startTime: '17:00',
      endTime: '20:00',
    });
    window.open(url, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🏏 Hey! I just RSVP'd for ${config.couple.brideName} & ${config.couple.groomName}'s Turf Day on ${selectedDateObj.shortDate}!\nI'm playing for *${teamConfig.name}*! 🔥\n\nPick your team and grab your jersey here: ${window.location.origin}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header celebration badge */}
          <div className="bg-gradient-to-r from-emerald-600 via-turf-600 to-emerald-700 px-6 pt-6 pb-5 text-center text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full bg-black/20 p-1.5 text-white/80 hover:bg-black/40 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, delay: 0.1 }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600 shadow-xl mb-3"
            >
              <CheckCircle2 className="h-8 w-8 text-emerald-600 fill-emerald-100" />
            </motion.div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              You're on the Match Sheet! 🎉
            </h3>
            <p className="text-xs text-emerald-100 mt-1">
              Your RSVP has been saved. We can't wait to see you on the turf!
            </p>
          </div>

          {/* Digital Match Pass / Ticket */}
          <div className="p-5 sm:p-6 bg-slate-50">
            <div className="relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 overflow-hidden">
              {/* Ticket Jagged Edges / Perforations */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 border-r border-slate-200" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-50 border-l border-slate-200" />

              {/* Match Header */}
              <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-3 mb-3">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  OFFICIAL PLAYER PASS
                </span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  CONFIRMED
                </span>
              </div>

              {/* Guest Name & Team */}
              <div className="mb-4">
                <span className="text-xs text-slate-400">Player Name</span>
                <h4 className="text-xl font-extrabold text-slate-900 leading-tight">
                  {rsvpData.name}
                </h4>

                <div className="mt-2 flex items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold text-white shadow-sm ${
                      isBride
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-700'
                    }`}
                  >
                    <Trophy className="h-3.5 w-3.5" />
                    <span>{teamConfig.name}</span>
                  </div>
                </div>
              </div>

              {/* Match Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Match Date</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Calendar className="h-3.5 w-3.5 text-turf-600" />
                    {selectedDateObj.shortDate} (5-8 PM)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Team Jersey</span>
                  <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Shirt className="h-3.5 w-3.5 text-turf-600" />
                    {rsvpData.needsJersey ? `Size ${rsvpData.jerseySize}` : 'No Jersey'}
                  </span>
                </div>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-2 text-[11px] text-slate-500 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{config.venue.name}, {config.venue.shortLocation}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-5 space-y-2.5">
              {/* WhatsApp Share */}
              <button
                onClick={handleShareWhatsApp}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-700/20 hover:bg-emerald-700 active:scale-98 transition-all"
              >
                <Share2 className="h-4 w-4" />
                <span>Share with Friends on WhatsApp</span>
              </button>

              {/* Calendar Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadIcs}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  <span>Download .ics</span>
                </button>
                <button
                  onClick={handleGoogleCalendar}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span>Google Cal</span>
                </button>
              </div>

              {/* Edit RSVP Button */}
              <button
                onClick={() => {
                  onClose();
                  if (onEditAgain) onEditAgain();
                }}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Need to modify your date or size? Edit RSVP</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
