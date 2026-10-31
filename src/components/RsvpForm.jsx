import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { config } from '../config';
import { saveRsvp, generateDocId } from '../services/db';
import SizeChartModal from './SizeChartModal';
import {
  User,
  Crown,
  Zap,
  Calendar,
  Shirt,
  Ruler,
  Check,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function RsvpForm({ initialTeam, onRsvpSuccess, existingRsvps = [] }) {
  // Form State
  const [name, setName] = useState('');
  const [team, setTeam] = useState(initialTeam || 'bride');
  const [preferredDate, setPreferredDate] = useState(config.dates[0]?.id || '2026-01-28');
  const [needsJersey, setNeedsJersey] = useState(true);
  const [jerseySize, setJerseySize] = useState('M');

  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isExistingEdit, setIsExistingEdit] = useState(false);

  // Sync initialTeam prop if clicked from FaceOffBanner
  useEffect(() => {
    if (initialTeam) {
      setTeam(initialTeam);
    }
  }, [initialTeam]);

  // Check if name matches an existing RSVP to inform user they are editing
  useEffect(() => {
    if (name.trim().length >= 3) {
      const docId = generateDocId(name);
      const matched = existingRsvps.find((r) => r.id === docId);
      if (matched) {
        setIsExistingEdit(true);
        // Pre-fill existing choices for friendly UX
        if (matched.team) setTeam(matched.team);
        if (matched.preferredDate) setPreferredDate(matched.preferredDate);
        if (typeof matched.needsJersey === 'boolean') setNeedsJersey(matched.needsJersey);
        if (matched.jerseySize && matched.jerseySize !== 'None') setJerseySize(matched.jerseySize);
      } else {
        setIsExistingEdit(false);
      }
    } else {
      setIsExistingEdit(false);
    }
  }, [name, existingRsvps]);

  // Determine total steps: 5 if jersey needed, 4 if not needed
  const totalSteps = needsJersey ? 5 : 4;

  const validateStep = (step) => {
    setErrorMsg('');
    if (step === 1) {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name to proceed.');
        return false;
      }
      if (name.trim().length < 2) {
        setErrorMsg('Please enter a valid full name.');
        return false;
      }
    }
    if (step === 2) {
      if (!team) {
        setErrorMsg('Please choose your squad (Team Bride or Team Groom).');
        return false;
      }
    }
    if (step === 3) {
      if (!preferredDate) {
        setErrorMsg('Please select your preferred event date.');
        return false;
      }
    }
    if (step === 5 && needsJersey) {
      if (!jerseySize) {
        setErrorMsg('Please pick a jersey size.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 4 && !needsJersey) {
        handleSubmit();
      } else {
        setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      }
    }
  };

  const handlePrev = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        name: name.trim(),
        team,
        preferredDate,
        needsJersey,
        jerseySize: needsJersey ? jerseySize : 'None',
      };

      const result = await saveRsvp(payload);

      if (result.success) {
        if (onRsvpSuccess) {
          onRsvpSuccess(payload);
        }
      } else {
        setErrorMsg('Unable to save RSVP. Please try again.');
      }
    } catch (err) {
      console.error('RSVP submit error', err);
      setErrorMsg('Something went wrong saving your RSVP. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="rsvp" className="py-12 sm:py-16 px-4 sm:px-6 bg-festive-warmgray relative">
      <div className="mx-auto max-w-lg">
        {/* Section Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Join the Match Sheet</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Reserve Your Spot & Jersey
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Takes less than 30 seconds! We need your squad choice and jersey size for custom printing.
          </p>
        </div>

        {/* Existing RSVP Notice */}
        {isExistingEdit && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-300 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              Found an existing RSVP for <strong>{name}</strong>! Resubmitting will update your choices without creating a duplicate.
            </span>
          </div>
        )}

        {/* Wizard Card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-200">
          {/* Progress Bar & Header */}
          <div className="border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span className="text-turf-700 font-bold">
                {currentStep === 1 && 'Player Info'}
                {currentStep === 2 && 'Select Squad'}
                {currentStep === 3 && 'Choose Date'}
                {currentStep === 4 && 'Jersey Option'}
                {currentStep === 5 && 'Select Size'}
              </span>
            </div>

            {/* Stepper bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 flex">
              <motion.div
                className="h-full bg-gradient-to-r from-turf-500 to-emerald-600 transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Step Body */}
          <form onSubmit={(e) => e.preventDefault()} className="p-5 sm:p-6">
            <AnimatePresence mode="wait">
              {/* STEP 1: Full Name */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="fullname" className="block text-sm font-bold text-slate-800 mb-1">
                      1. What is your full name? <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-xs text-slate-400 mb-3">
                      This will be printed on the match roster and jersey handover list.
                    </p>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <User className="h-5 w-5" />
                      </div>
                      <input
                        id="fullname"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errorMsg) setErrorMsg('');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleNext();
                          }
                        }}
                        placeholder="e.g. Siddharth Rao"
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-turf-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-turf-500/15"
                        autoFocus
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Team Selection */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      2. Choose your squad <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-xs text-slate-400 mb-3">
                      Tap the team card you'd like to back on the pitch!
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Team Bride Option */}
                      <div
                        onClick={() => setTeam('bride')}
                        className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                          team === 'bride'
                            ? 'border-rose-500 bg-rose-50/70 shadow-md ring-2 ring-rose-400/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-sm">
                            <Crown className="h-5 w-5" />
                          </div>
                          {team === 'bride' && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-extrabold text-rose-950">
                          {config.teams.bride.name}
                        </h4>
                        <p className="text-xs text-rose-700 mt-0.5">
                          {config.teams.bride.subtitle}
                        </p>
                        <span className="mt-2 text-[10px] font-semibold text-rose-600 uppercase tracking-wider">
                          Jersey: {config.teams.bride.colorName}
                        </span>
                      </div>

                      {/* Team Groom Option */}
                      <div
                        onClick={() => setTeam('groom')}
                        className={`relative cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                          team === 'groom'
                            ? 'border-blue-500 bg-blue-50/70 shadow-md ring-2 ring-blue-400/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white shadow-sm">
                            <Zap className="h-5 w-5" />
                          </div>
                          {team === 'groom' && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-extrabold text-blue-950">
                          {config.teams.groom.name}
                        </h4>
                        <p className="text-xs text-blue-700 mt-0.5">
                          {config.teams.groom.subtitle}
                        </p>
                        <span className="mt-2 text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                          Jersey: {config.teams.groom.colorName}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Preferred Date */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      3. Which date will you be attending? <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-xs text-slate-400 mb-3">
                      We're hosting two turf sessions — please pick your preferred evening:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {config.dates.map((dateObj) => {
                        const isSelected = preferredDate === dateObj.id;
                        return (
                          <div
                            key={dateObj.id}
                            onClick={() => setPreferredDate(dateObj.id)}
                            className={`cursor-pointer rounded-2xl p-4 border-2 transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'border-turf-600 bg-turf-50/80 shadow-md ring-2 ring-turf-500/20'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="flex items-center gap-1.5 text-xs font-bold text-turf-800">
                                <Calendar className="h-4 w-4 text-turf-600" />
                                {dateObj.dayName}
                              </span>
                              {isSelected && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-turf-600 text-white">
                                  <Check className="h-3 w-3" />
                                </span>
                              )}
                            </div>
                            <h4 className="text-lg font-black text-slate-900">
                              {dateObj.shortDate}
                            </h4>
                            <span className="text-xs font-medium text-slate-500 mt-1">
                              {dateObj.time}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Jersey Requirement */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">
                      4. Custom jersey available. Do you need one? <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-xs text-slate-400 mb-3">
                      We are printing team jerseys with your squad colors for everyone playing!
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setNeedsJersey(true)}
                        className={`flex flex-col items-center justify-center rounded-2xl p-5 border-2 transition-all ${
                          needsJersey
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-md ring-2 ring-emerald-500/20 font-bold'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-2">
                          <Shirt className="h-6 w-6" />
                        </div>
                        <span className="text-base font-extrabold">Yes, please!</span>
                        <span className="text-[11px] text-emerald-700 mt-1">I want a team jersey</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNeedsJersey(false)}
                        className={`flex flex-col items-center justify-center rounded-2xl p-5 border-2 transition-all ${
                          !needsJersey
                            ? 'border-slate-700 bg-slate-100 text-slate-900 shadow-md font-bold'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600 mb-2">
                          <Check className="h-6 w-6" />
                        </div>
                        <span className="text-base font-extrabold">No, thanks</span>
                        <span className="text-[11px] text-slate-500 mt-1">I'll wear my own outfit</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Jersey Size (Only shown if needsJersey is true) */}
              {currentStep === 5 && needsJersey && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-sm font-bold text-slate-800">
                        5. Select your jersey size <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsSizeChartOpen(true)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-turf-700 hover:text-turf-900 underline underline-offset-2"
                      >
                        <Ruler className="h-3.5 w-3.5" />
                        <span>View size chart</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      Standard unisex athletic sizing (XS to 3XL):
                    </p>

                    {/* Size Selector Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {config.jerseySizeChart.map((item) => {
                        const isSelected = jerseySize === item.size;
                        return (
                          <button
                            key={item.size}
                            type="button"
                            onClick={() => setJerseySize(item.size)}
                            className={`flex flex-col items-center justify-center rounded-xl py-3 border-2 transition-all ${
                              isSelected
                                ? 'border-turf-600 bg-turf-600 text-white font-extrabold shadow-md scale-105'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 font-semibold'
                            }`}
                          >
                            <span className="text-sm sm:text-base">{item.size}</span>
                            <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                              {item.chest}cm
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {errorMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Nav & Submit Buttons */}
            <div className="mt-6 flex items-center gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              )}

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-turf-600 to-emerald-700 py-3 px-5 text-xs sm:text-sm font-bold text-white shadow-md shadow-turf-800/20 hover:from-turf-700 hover:to-emerald-800 active:scale-98 transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-turf-600 to-emerald-700 py-3.5 px-6 text-sm font-extrabold text-white shadow-lg shadow-emerald-900/30 hover:from-emerald-700 hover:to-emerald-800 active:scale-98 disabled:opacity-75 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Saving your spot...</span>
                    </>
                  ) : (
                    <>
                      <span>{isExistingEdit ? 'Update My RSVP' : 'Confirm RSVP & Jersey'}</span>
                      <Sparkles className="h-4 w-4 text-amber-300" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={isSizeChartOpen}
        onClose={() => setIsSizeChartOpen(false)}
        onSelectSize={(sz) => setJerseySize(sz)}
      />
    </section>
  );
}
