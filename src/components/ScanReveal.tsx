import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface ScanRevealProps {
  children: React.ReactNode;
  delayMs?: number;
}

export const ScanReveal: React.FC<ScanRevealProps> = ({ children, delayMs = 0 }) => {
  const [hasSwept, setHasSwept] = useState(false);

  useEffect(() => {
    // Hide the sweeping laser after it completes to maintain high performance
    const totalDuration = delayMs + 600;
    const timer = setTimeout(() => {
      setHasSwept(true);
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [delayMs]);

  const delaySec = delayMs / 1000;

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[6px]">
      {/* Sweeping scanline */}
      {!hasSwept && (
        <motion.div
          className="absolute left-0 right-0 h-[1.5px] bg-white z-20 pointer-events-none"
          style={{
            boxShadow: '0 0 10px #ffffff, 0 0 4px #ffffff',
          }}
          initial={{ top: '0%' }}
          animate={{ top: '100%' }}
          transition={{
            duration: 0.4,
            ease: 'easeInOut',
            delay: delaySec,
          }}
        />
      )}

      {/* Fading child */}
      <motion.div
        className="w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.2,
          ease: 'easeOut',
          delay: delaySec + 0.35, // Start fading in as the line completes its sweep
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};
