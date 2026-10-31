import React, { useState } from 'react';
import { config } from '../config';
import { Trophy, Menu, X, Shield, CalendarCheck } from 'lucide-react';

export default function Navbar({ onNavigateToAdmin, activeView }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (activeView === 'admin') {
      window.location.hash = '';
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      <div className="mx-auto max-w-5xl px-4 py-2.5 sm:px-6">
        <nav className="glass-panel flex items-center justify-between rounded-full px-4 py-2.5 shadow-md shadow-slate-900/5">
          {/* Couple Monogram / Brand */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (activeView === 'admin') {
                window.location.hash = '';
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-2 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-turf-700 to-turf-500 text-white shadow-sm transition-transform group-hover:scale-105">
              <Trophy className="h-4 w-4 text-amber-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-script text-xl leading-none font-bold text-slate-800">
                {config.couple.brideName} & {config.couple.groomName}
              </span>
              <span className="text-[10px] tracking-wider font-semibold uppercase text-turf-700">
                Turf Day 🏏
              </span>
            </div>
          </a>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => scrollToSection('faceoff')}
              className="hover:text-turf-700 transition-colors"
            >
              Teams
            </button>
            <button
              onClick={() => scrollToSection('timeline')}
              className="hover:text-turf-700 transition-colors"
            >
              Timeline
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className="hover:text-turf-700 transition-colors"
            >
              Our Story
            </button>
            <button
              onClick={() => scrollToSection('venue')}
              className="hover:text-turf-700 transition-colors"
            >
              Venue
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {activeView === 'admin' ? (
              <button
                onClick={() => {
                  window.location.hash = '';
                }}
                className="flex items-center gap-1.5 rounded-full bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-700 transition-all"
              >
                ← Back to Invitation
              </button>
            ) : (
              <>
                <button
                  onClick={() => scrollToSection('rsvp')}
                  className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-turf-600 to-emerald-700 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:from-turf-700 hover:to-emerald-800 active:scale-95 transition-all"
                >
                  <CalendarCheck className="h-3.5 w-3.5 text-emerald-200" />
                  <span>RSVP Now</span>
                </button>

                <button
                  onClick={onNavigateToAdmin}
                  title="Organizer Admin Portal"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Shield className="h-4 w-4" />
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100"
                  aria-label="Toggle Navigation Menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mt-2 md:hidden glass-panel rounded-2xl p-4 shadow-xl border border-white/60 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-3 text-sm font-medium text-slate-700">
              <button
                onClick={() => scrollToSection('faceoff')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100 flex items-center justify-between"
              >
                <span>Team Bride vs Team Groom</span>
                <span className="text-xs text-turf-600 font-semibold">Face-off</span>
              </button>
              <button
                onClick={() => scrollToSection('timeline')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Evening Schedule & Timeline
              </button>
              <button
                onClick={() => scrollToSection('gallery')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Our Moments & Story
              </button>
              <button
                onClick={() => scrollToSection('venue')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Venue & Map Location
              </button>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateToAdmin();
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin Portal</span>
                </button>
                <span className="text-xs text-amber-600 font-medium">#BrideGroomHashtag</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
