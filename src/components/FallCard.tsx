import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlowCard } from './GlowCard';
import { ScanReveal } from './ScanReveal';
import { MetricLabel } from './MetricLabel';
import { AppColors } from '../utils/theme';

interface FallCardProps {
  fallDetected: boolean;
}

export const FallCard: React.FC<FallCardProps> = ({ fallDetected }) => {
  const fallStatus = fallDetected ? 'critical' : 'neutral';

  return (
    <ScanReveal delayMs={450}>
      <GlowCard status={fallStatus} className="h-full min-h-[178px]">
        <div className="flex flex-col h-full justify-between items-stretch">
          
          <AnimatePresence mode="wait">
            {!fallDetected ? (
              // Normal Stable Motion State
              <motion.div
                key="stable"
                className="flex flex-col h-full justify-between gap-1"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header row */}
                <div className="flex items-center justify-between select-none">
                  <MetricLabel text="MOTION STATUS" showDot={true} />
                  <span className="font-sans text-[10px] font-black tracking-widest bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                    STABLE
                  </span>
                </div>

                {/* Glyph element */}
                <div className="flex-1 flex items-center justify-start py-3 select-none">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl filter saturate-[0.85]">🧘</span>
                    <div>
                      <span className="text-sm font-bold text-slate-800 block">Resting State</span>
                      <span className="text-[10px] text-slate-400 block font-medium leading-none mt-1">G-Force normal</span>
                    </div>
                  </div>
                </div>

                {/* Sub status */}
                <div className="flex items-center gap-1.5 select-none w-fit px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="font-sans text-[9px] text-slate-500 font-extrabold tracking-widest uppercase">
                    ACCELEROMETER ACTIVE
                  </span>
                </div>
              </motion.div>
            ) : (
              // Fall Detected Alarm State
              <motion.div
                key="alert"
                className="flex flex-col h-full justify-between gap-1"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {/* Header row with alert pill */}
                <div className="flex items-center justify-between select-none">
                  <MetricLabel text="MOTION STATUS" showDot={true} />
                  
                  {/* FallAlertBadge */}
                  <div 
                    className="px-2.5 py-1 border rounded-full bg-rose-50 border-rose-200"
                  >
                    <span 
                      className="font-sans text-[9px] font-black tracking-widest block leading-none text-rose-600 uppercase"
                    >
                      ALERT
                    </span>
                  </div>
                </div>

                {/* Alarm warning details */}
                <div className="flex-1 flex items-center gap-3 py-3 select-none">
                  <span 
                    className="text-3xl block animate-bounce"
                  >
                    🚨
                  </span>
                  <div>
                    <span 
                      className="font-sans text-sm font-black tracking-tight block leading-tight text-rose-600 uppercase"
                    >
                      FALL DETECTED
                    </span>
                    <span className="font-sans text-[10px] text-slate-400 block mt-0.5 leading-tight font-medium">
                      High impact event captured!
                    </span>
                  </div>
                </div>

                {/* Alarm state footer */}
                <div className="flex items-center gap-1.5 select-none w-fit px-2.5 py-1 bg-rose-50 border border-rose-100 rounded-full">
                  <span className="w-2 h-2 rounded-full animate-ping bg-rose-600" />
                  <span 
                    className="font-sans text-[9px] font-extrabold tracking-widest leading-none uppercase text-rose-600"
                  >
                    EMERGENCY PING ACTIVE
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </GlowCard>
    </ScanReveal>
  );
};

