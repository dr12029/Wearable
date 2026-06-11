import React from 'react';
import { AppColors } from '../utils/theme';

interface StatusLedProps {
  status: 'online' | 'offline' | 'alert';
}

export const StatusLed: React.FC<StatusLedProps> = ({ status }) => {
  let bgColor = AppColors.textTertiary;
  let boxShadow = 'none';
  let className = 'w-2 h-2 rounded-full shrink-0 transition-all duration-300';

  if (status === 'online') {
    bgColor = AppColors.ok;
    boxShadow = `0 0 6px ${AppColors.okGlow}`;
  } else if (status === 'alert') {
    bgColor = AppColors.crit;
    boxShadow = `0 0 8px rgba(225, 29, 72, 0.4)`;
    className += ' animate-pulse';
  }

  return (
    <div 
      className={className} 
      style={{ 
        backgroundColor: bgColor,
        boxShadow: boxShadow
      }}
    />
  );
};

