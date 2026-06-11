import React from 'react';
import { GlowCard } from './GlowCard';
import { ScanReveal } from './ScanReveal';
import { MetricLabel } from './MetricLabel';
import { AnimatedNumber } from './AnimatedNumber';
import { Spo2ArcWidget } from './Spo2ArcWidget';
import { Thresholds } from '../utils/thresholds';
import { AppColors } from '../utils/theme';

interface Spo2CardProps {
  spo2: number;
}

export const Spo2Card: React.FC<Spo2CardProps> = ({ spo2 }) => {
  const spo2Status = Thresholds.spo2Status(spo2);
  const statusColor = Thresholds.getStatusColor(spo2Status);

  let spo2LabelText = 'OPTIMAL';
  if (spo2 < 92) spo2LabelText = 'HYPOXIA CRITICAL';
  else if (spo2 < 95) spo2LabelText = 'LOW SATURATION';

  return (
    <ScanReveal delayMs={150}>
      <GlowCard status={spo2Status} className="h-full min-h-[178px]">
        <div className="flex flex-col h-full justify-between items-stretch">
          <MetricLabel text="BLOOD OXYGEN" showDot={true} />

          <div className="flex-1 flex items-center justify-between py-2 overflow-visible select-none">
            {/* Value Display */}
            <div className="flex flex-col text-left">
              <div className="flex items-baseline gap-0.5">
                <AnimatedNumber 
                  value={spo2} 
                  fractionDigits={1} 
                  className="font-mono text-4xl font-extrabold tracking-tight text-slate-900" 
                />
                <span className="font-sans text-xs text-slate-400 font-bold">%</span>
              </div>
              <span className="font-sans text-[10px] font-black uppercase tracking-widest mt-1 text-slate-400">
                SATURATION
              </span>
            </div>

            {/* Sweep Gauge overlay */}
            <Spo2ArcWidget spo2={spo2} statusColor={statusColor} />
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
              {spo2LabelText}
            </span>
          </div>
        </div>
      </GlowCard>
    </ScanReveal>
  );
};

