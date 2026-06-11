import React from 'react';
import { AppColors } from '../utils/theme';

interface MetricLabelProps {
  text: string;
  showDot?: boolean;
}

export const MetricLabel: React.FC<MetricLabelProps> = ({ text, showDot = false }) => {
  return (
    <div className="flex items-center gap-2 select-none">
      {showDot && (
        <span 
          className="w-1.5 h-1.5 rounded-full block shrink-0" 
          style={{ backgroundColor: AppColors.textTertiary }}
        />
      )}
      <span 
        className="font-sans text-[10px] font-black uppercase tracking-widest leading-none text-slate-400"
      >
        {text}
      </span>
    </div>
  );
};

