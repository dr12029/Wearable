import React from 'react';
import { motion } from 'motion/react';
import { AppColors } from '../utils/theme';

interface Spo2ArcWidgetProps {
  spo2: number;
  statusColor: string;
}

export const Spo2ArcWidget: React.FC<Spo2ArcWidgetProps> = ({ spo2, statusColor }) => {
  // Map SpO2 range 80–100 onto 0–100% fraction
  const rawFraction = (spo2 - 80) / 20;
  const fraction = Math.max(0, Math.min(1, rawFraction));

  // A 180-degree semicircular path drawing an arc that sweeps upwards.
  // Using an arc centered at (40, 40) with radius 30:
  // Starts on left at (10, 40) and sweeps to right (70, 40).
  // Semicircle length = PI * R = 3.14159 * 30 = 94.25
  const arcLength = 94.25;
  const strokeDashoffset = arcLength * (1 - fraction);

  return (
    <div className="relative w-22 h-14 overflow-hidden select-none flex items-end justify-center">
      <svg className="w-22 h-11 overflow-visible" viewBox="0 0 80 40">
        {/* Track */}
        <path
          d="M 10 40 A 30 30 0 0 1 70 40"
          fill="none"
          stroke={AppColors.borderDim}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Fill */}
        <motion.path
          d="M 10 40 A 30 30 0 0 1 70 40"
          fill="none"
          stroke={statusColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${arcLength}`}
          animate={{ strokeDashoffset }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
        />

        {/* Dynamic target marker for aesthetic */}
        <line
          x1="10"
          y1="40"
          x2="6"
          y2="40"
          stroke={AppColors.borderBase}
          strokeWidth="1.5"
        />
        <line
          x1="70"
          y1="40"
          x2="74"
          y2="40"
          stroke={AppColors.borderBase}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};

