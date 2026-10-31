import React, { useState } from 'react';
import { config } from '../config';
import { Phone, MessageCircle, Copy, Check, Heart, Shield } from 'lucide-react';

export default function Footer({ onNavigateToAdmin }) {
  const [copied, setCopied] = useState(false);

  const handleCopyHashtag = () => {
    navigator.clipboard.writeText(config.couple.hashtag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-white pt-12 pb-8 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl text-center">
        {/* Couple Hashtag with Copy */}
        <div className="mb-6">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-2">
            Official Celebration Hashtag
          </span>
          <button
            onClick={handleCopyHashtag}
            className="group inline-flex items-center gap-2 rounded-2xl bg-slate-900 border border-slate-800 px-5 py-2.5 text-base sm:text-lg font-black text-amber-300 hover:border-amber-400/50 hover:bg-slate-800 transition-all shadow-md"
          >
            <span>{config.couple.hashtag}</span>
            {copied ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                <Check className="h-4 w-4" /> Copied!
              </span>
            ) : (
              <Copy className="h-4 w-4 text-slate-400 group-hover:text-amber-300 transition-colors" />
            )}
          </button>
        </div>

        {/* Organizers Contact Numbers */}
        <div className="mb-8 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 max-w-lg mx-auto">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Questions? Contact The Organizers
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {config.contacts.map((contact, i) => (
              <div
                key={i}
                className="rounded-xl bg-slate-800/80 p-3 border border-slate-700/60 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    {contact.role}
                  </span>
                  <p className="text-xs font-bold text-white mt-0.5">{contact.name}</p>
                  <p className="text-[11px] text-slate-300 font-mono mt-0.5">{contact.phone}</p>
                </div>

                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-700">
                  <a
                    href={`https://wa.me/${contact.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 py-1.5 text-[11px] font-semibold transition-colors"
                  >
                    <MessageCircle className="h-3 w-3" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 py-1.5 text-[11px] font-semibold transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warm sign-off */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-6">
          <span>Made with love for</span>
          <span className="font-bold text-white">
            {config.couple.brideName} & {config.couple.groomName}
          </span>
          <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
        </div>

        {/* Admin Link */}
        <div className="border-t border-slate-900 pt-6 flex items-center justify-between text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Pre-Wedding Turf Day</span>
          <button
            onClick={onNavigateToAdmin}
            className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors py-1 px-2 rounded hover:bg-slate-900"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Organizer Admin</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
