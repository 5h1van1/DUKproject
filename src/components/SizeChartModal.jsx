import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { config } from '../config';
import { X, Ruler, Info } from 'lucide-react';

export default function SizeChartModal({ isOpen, onClose, onSelectSize }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-turf-50 to-emerald-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-turf-600 text-white shadow-sm">
                <Ruler className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Jersey Size Chart
                </h3>
                <p className="text-xs text-slate-500">All measurements in centimeters (cm)</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Table */}
          <div className="p-4 sm:p-5">
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-3.5 py-2.5">Size</th>
                    <th className="px-3.5 py-2.5">Chest</th>
                    <th className="px-3.5 py-2.5">Length</th>
                    <th className="px-3.5 py-2.5">Shoulder</th>
                    <th className="px-2 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {config.jerseySizeChart.map((row) => (
                    <tr
                      key={row.size}
                      className="hover:bg-turf-50/50 transition-colors group cursor-pointer"
                      onClick={() => {
                        if (onSelectSize) onSelectSize(row.size);
                        onClose();
                      }}
                    >
                      <td className="px-3.5 py-2.5 font-bold text-turf-800">
                        {row.size}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono">{row.chest} cm</td>
                      <td className="px-3.5 py-2.5 font-mono">{row.length} cm</td>
                      <td className="px-3.5 py-2.5 font-mono">{row.shoulder} cm</td>
                      <td className="px-2 py-2.5 text-center">
                        <button
                          type="button"
                          className="rounded-lg bg-turf-100 px-2 py-1 text-[11px] font-semibold text-turf-800 hover:bg-turf-600 hover:text-white transition-colors"
                        >
                          Pick
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sizing tip */}
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200">
              <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                <strong>Fitting Tip:</strong> The jerseys are breathable athletic dri-fit. If you prefer a relaxed or loose boxy fit on the turf, consider picking one size up!
              </p>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                Close & Return to Form
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
