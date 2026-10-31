import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { config } from '../config';
import { Heart, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

export default function StoryGallery() {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const gallery = config.gallery || [];

  const handlePrev = () => {
    setCarouselIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCarouselIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  const openLightbox = (index) => {
    setActiveLightboxIndex(index);
  };

  const closeLightbox = () => {
    setActiveLightboxIndex(null);
  };

  return (
    <section id="gallery" className="py-12 sm:py-16 px-4 sm:px-6 bg-festive-cream">
      <div className="mx-auto max-w-4xl">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-2">
            <Heart className="h-3.5 w-3.5 text-rose-600 fill-rose-600" />
            <span>Our Journey</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Moments on & off the Pitch
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            From cricket bickering to forever teammates. Swipe through our favorite memories!
          </p>
        </div>

        {/* Mobile Swipeable / Interactive Carousel Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-200/60 p-2 sm:p-4">
          <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-950">
            <AnimatePresence mode="wait">
              <motion.img
                key={carouselIndex}
                src={gallery[carouselIndex]?.image}
                alt={gallery[carouselIndex]?.title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="h-full w-full object-cover cursor-pointer"
                onClick={() => openLightbox(carouselIndex)}
              />
            </AnimatePresence>

            {/* Gradient Overlay for Caption readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Tag badge */}
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-amber-300 border border-amber-300/30">
                {gallery[carouselIndex]?.tag}
              </span>
            </div>

            {/* Lightbox Trigger button */}
            <button
              onClick={() => openLightbox(carouselIndex)}
              className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/90 transition-colors backdrop-blur-md"
              title="Expand photo"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {/* Bottom Caption */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white">
              <h3 className="text-lg sm:text-xl font-bold drop-shadow-sm">
                {gallery[carouselIndex]?.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 line-clamp-2 drop-shadow">
                {gallery[carouselIndex]?.caption}
              </p>
            </div>

            {/* Nav Arrows */}
            <button
              onClick={handlePrev}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/80 active:scale-95 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next slide"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/80 active:scale-95 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Carousel Dots & Thumbnails Strip */}
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-1.5">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCarouselIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    carouselIndex === i ? 'w-6 bg-turf-600' : 'w-2 bg-slate-300'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <span className="text-xs font-mono font-medium text-slate-500">
              {carouselIndex + 1} of {gallery.length}
            </span>
          </div>

          {/* Small thumbnail previews */}
          <div className="mt-3 grid grid-cols-4 gap-2">
            {gallery.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setCarouselIndex(i)}
                className={`relative aspect-video overflow-hidden rounded-xl border-2 transition-all ${
                  carouselIndex === i
                    ? 'border-turf-600 ring-2 ring-turf-500/30 scale-102'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeLightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-lg"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
              aria-label="Close Lightbox"
            >
              <X className="h-6 w-6" />
            </button>

            <div
              className="relative max-w-3xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={gallery[activeLightboxIndex]?.image}
                alt={gallery[activeLightboxIndex]?.title}
                className="max-h-[75vh] w-full rounded-2xl object-contain mx-auto shadow-2xl"
              />
              <div className="mt-4 rounded-xl bg-slate-900/90 p-4 text-white border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    {gallery[activeLightboxIndex]?.tag}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {activeLightboxIndex + 1} / {gallery.length}
                  </span>
                </div>
                <h3 className="text-lg font-bold">
                  {gallery[activeLightboxIndex]?.title}
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  {gallery[activeLightboxIndex]?.caption}
                </p>
              </div>

              {/* Lightbox prev / next */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLightboxIndex((prev) =>
                    prev === 0 ? gallery.length - 1 : prev - 1
                  );
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLightboxIndex((prev) =>
                    prev === gallery.length - 1 ? 0 : prev + 1
                  );
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
