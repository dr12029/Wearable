import React from 'react';
import { EcgPoint } from '../types';
import { EcgChartWidget } from './EcgChartWidget';
import { MetricLabel } from './MetricLabel';
import { GlowCard } from './GlowCard';
import { AppColors } from '../utils/theme';

interface EcgPanelProps {
  ecgBuffer: EcgPoint[];
}

export const EcgPanel: React.FC<EcgPanelProps> = ({ ecgBuffer }) => {
  return (
    <GlowCard status="neutral" paddingClassName="p-5" className="text-left select-none">
      <div className="flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <MetricLabel text="ECG — LEAD I" showDot={true} />
          <span className="font-mono text-[9px] text-slate-400 font-extrabold tracking-wider uppercase">
            200 Hz REALTIME
          </span>
         </div>

        {/* Core waveform viewport */}
        <EcgChartWidget ecgBuffer={ecgBuffer} />
        
        <div className="flex justify-between items-center text-[9px] font-sans text-slate-400 font-bold tracking-widest uppercase">
          <span>CH01 // FEED_OK</span>
          <span>DIAGNOSTIC LABS</span>
        </div>
      </div>
    </GlowCard>
  );
};

