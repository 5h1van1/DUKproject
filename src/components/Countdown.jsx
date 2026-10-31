import React, { useState, useEffect } from 'react';
import { config } from '../config';

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  useEffect(() => {
    const target = new Date(config.countdownTarget).getTime();

    const calculate = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeUnits = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HOURS', value: timeLeft.hours },
    { label: 'MINS', value: timeLeft.minutes },
    { label: 'SECS', value: timeLeft.seconds },
  ];

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="flex items-center justify-center gap-1.5 sm:gap-2.5">
        {timeUnits.map((unit, idx) => (
          <div
            key={idx}
            className="flex-1 flex flex-col items-center justify-center rounded-xl bg-slate-900/80 backdrop-blur-md px-2 py-2 sm:py-2.5 border border-amber-400/30 shadow-md shadow-black/20"
          >
            <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-tight leading-none">
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 tracking-wider mt-1 uppercase">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-center">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-200/90 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-500/20">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Countdown to Match Day Kick-off
        </span>
      </div>
    </div>
  );
}
