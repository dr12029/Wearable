import React from 'react';
import { motion } from 'motion/react';
import { AppColors, AppSpacing } from '../utils/theme';
import { VitalStatus } from '../types';

interface GlowCardProps {
  status: VitalStatus | 'neutral';
  children: React.ReactNode;
  paddingClassName?: string;
  className?: string;
}

export const GlowCard: React.FC<GlowCardProps> = ({
  status,
  children,
  paddingClassName = 'p-5',
  className = '',
}) => {
  const isCritical = status === 'critical';
  const isWarning = status === 'warning';

  // Smooth, luxurious shadows & borders typical of Premium Bento Grid dashboards
  const cardTransitions = isCritical
    ? {
        borderColor: AppColors.crit,
        boxShadow: '0 0 16px rgba(225, 29, 72, 0.25), 0 4px 20px rgba(15, 23, 42, 0.05)',
        backgroundColor: 'rgba(255, 241, 242, 0.9)', // very light rose tint for alert state
      }
    : isWarning
    ? {
        borderColor: AppColors.warn,
        boxShadow: '0 0 12px rgba(217, 119, 6, 0.2), 0 4px 20px rgba(15, 23, 42, 0.05)',
        backgroundColor: 'rgba(255, 251, 235, 0.9)', // very light amber tint
      }
    : {
        borderColor: AppColors.borderDim,
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
        backgroundColor: AppColors.bgSurface,
      };

  return (
    <motion.div
      className={`rounded-[24px] border ${paddingClassName} ${className} relative overflow-hidden`}
      animate={cardTransitions}
      transition={
        isCritical
          ? {
              duration: 1.4,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }
          : {
              duration: 0.35,
              ease: 'easeOut',
            }
      }
      style={{
        borderColor: isCritical ? AppColors.crit : isWarning ? AppColors.warn : AppColors.borderDim,
        backgroundColor: isCritical ? 'rgba(255, 241, 242, 0.9)' : isWarning ? 'rgba(255, 251, 235, 0.9)' : AppColors.bgSurface,
      }}
    >
      {/* Background dot matrix details - extremely subtle in light mode */}
      <div className="absolute inset-0 nothing-dot-grid pointer-events-none opacity-[0.4]" />
      
      {/* Decorative colored corner bar or light flare to signify bento status */}
      {(isCritical || isWarning) && (
        <div 
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ backgroundColor: isCritical ? AppColors.crit : AppColors.warn }}
        />
      )}

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};

