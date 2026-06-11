import React from 'react';
import { motion } from 'motion/react';
import { AppColors } from '../utils/theme';

interface ThermometerBarWidgetProps {
  temp: number;
  statusColor: string;
}

export const ThermometerBarWidget: React.FC<ThermometerBarWidgetProps> = ({ temp, statusColor }) => {
  // Map core temperature range 35.0 - 40.0°C to 0 - 100%
  const percentage = (temp - 35.0) / (40.0 - 35.0);
  const clampedPercentage = Math.max(0, Math.min(1, percentage));
  const fillHeight = clampedPercentage * 80; // height in pixels out of 80px maximum

  return (
    <div className="flex flex-col items-center select-none">
      {/* Container */}
      <div 
        className="h-20 w-[8px] rounded-full overflow-hidden relative"
        style={{ backgroundColor: AppColors.borderDim }}
      >
        {/* Active Fill Segment */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          animate={{ 
            height: `${fillHeight}px`,
            backgroundColor: statusColor
          }}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
          }}
        />
      </div>

      {/* Decorative tick markers flanking the bar */}
      <div className="h-2 flex items-center justify-between w-5 mt-2">
        <span className="w-1.5 h-[1.5px]" style={{ backgroundColor: AppColors.borderBase }} />
        <span className="w-1.5 h-[1.5px]" style={{ backgroundColor: AppColors.borderBase }} />
      </div>
    </div>
  );
};

