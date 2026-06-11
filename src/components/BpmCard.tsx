import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlowCard } from './GlowCard';
import { ScanReveal } from './ScanReveal';
import { MetricLabel } from './MetricLabel';
import { AnimatedNumber } from './AnimatedNumber';
import { Thresholds } from '../utils/thresholds';
import { AppColors } from '../utils/theme';

interface BpmCardProps {
  bpm: number;
}

export const BpmCard: React.FC<BpmCardProps> = ({ bpm }) => {
  const [beatCount, setBeatCount] = useState(0);

  // Synchronize dynamic ring animations to the active Heart Rate (BPM)
  useEffect(() => {
    if (bpm <= 0) return;
    
    const intervalMs = 60000 / bpm;
    const interval = setInterval(() => {
      setBeatCount((prev) => prev + 1);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [bpm]);

  // Determine status classification
  const bpmStatus = Thresholds.bpmStatus(bpm);
  const statusColor = Thresholds.getStatusColor(bpmStatus);

  // Status message mappings
  let bpmStateText = 'NORMAL';
  if (bpm < 45) bpmStateText = 'BRADYCARDIA';
  else if (bpm < 50) bpmStateText = 'LOW';
  else if (bpm > 130) bpmStateText = 'TACHYCARDIA';
  else if (bpm > 110) bpmStateText = 'ELEVATED';

  return (
    <ScanReveal delayMs={0}>
      <GlowCard status={bpmStatus} className="h-full min-h-[178px]">
        <div className="flex flex-col h-full justify-between items-stretch">
          <MetricLabel text="HEART RATE" showDot={true} />

          {/* Central Beat Simulator & Stats Display */}
          <div className="flex-1 flex flex-col justify-center items-center relative overflow-visible py-4 select-none">
            {/* Pulsing Circular Beat Ring Overlay */}
            <AnimatePresence mode="popLayout">
              <motion.div
                key={beatCount}
                className="absolute border rounded-full w-[56px] h-[56px] pointer-events-none z-0"
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{ scale: 2.2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, ease: 'easeOut' }}
                style={{ borderColor: statusColor }}
              />
            </AnimatePresence>

            {/* Human Numeric Value readout */}
            <div className="relative z-10 flex flex-col items-center">
              <span className="flex items-baseline">
                <AnimatedNumber 
                  value={bpm} 
                  fractionDigits={0} 
                  className="font-mono text-5xl font-extrabold tracking-tight leading-none text-slate-900 select-all" 
                />
              </span>
              <span className="font-sans text-[10px] font-black uppercase tracking-widest mt-2 text-slate-400">
                BPM
              </span>
            </div>
          </div>

          {/* Diagnostic classification status */}
          <div className="flex items-center gap-1.5 select-none w-fit px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-full">
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: statusColor }} 
            />
            <span 
              className="font-sans text-[9px] font-extrabold tracking-wider leading-none"
              style={{ color: statusColor }}
            >
              {bpmStateText}
            </span>
          </div>
        </div>
      </GlowCard>
    </ScanReveal>
  );
};

