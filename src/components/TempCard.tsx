import React from 'react';
import { GlowCard } from './GlowCard';
import { ScanReveal } from './ScanReveal';
import { MetricLabel } from './MetricLabel';
import { AnimatedNumber } from './AnimatedNumber';
import { ThermometerBarWidget } from './ThermometerBarWidget';
import { Thresholds } from '../utils/thresholds';
import { AppColors } from '../utils/theme';

interface TempCardProps {
  temp: number;
}

export const TempCard: React.FC<TempCardProps> = ({ temp }) => {
  const tempStatus = Thresholds.tempStatus(temp);
  const statusColor = Thresholds.getStatusColor(tempStatus);

  let tempLabelText = 'STABLE';
  if (temp > 38.0) tempLabelText = 'PYREXIA CRITICAL';
  else if (temp > 37.5) tempLabelText = 'FEVER ELEVATED';
  else if (temp < 35.5) tempLabelText = 'HYPOTHERMIA CRIT';
  else if (temp < 36.0) tempLabelText = 'MILD DEPRESSION';

  return (
    <ScanReveal delayMs={300}>
      <GlowCard status={tempStatus} className="h-full min-h-[178px]">
        <div className="flex flex-col h-full justify-between items-stretch">
          <MetricLabel text="TEMPERATURE" showDot={true} />

          <div className="flex-1 flex items-center justify-between py-2 select-none">
            {/* Value and label */}
            <div className="flex flex-col text-left">
              <div className="flex items-baseline gap-0.5">
                <AnimatedNumber 
                  value={temp} 
                  fractionDigits={1} 
                  className="font-mono text-4xl font-extrabold tracking-tight text-slate-900" 
                />
                <span className="font-sans text-xs text-slate-400 font-bold">°C</span>
              </div>
              <span className="font-sans text-[10px] font-black uppercase tracking-widest mt-1 text-slate-400">
                CELSIUS CORE
              </span>
            </div>

            {/* Level Thermometer Bar Widget */}
            <ThermometerBarWidget temp={temp} statusColor={statusColor} />
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
              {tempLabelText}
            </span>
          </div>
        </div>
      </GlowCard>
    </ScanReveal>
  );
};

