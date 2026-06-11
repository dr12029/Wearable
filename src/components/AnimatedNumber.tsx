import React, { useEffect, useState, useRef } from 'react';
import { animate } from 'motion/react';

interface AnimatedNumberProps {
  value: number;
  fractionDigits?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  fractionDigits = 0,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const controls = animate(prevValueRef.current, value, {
      duration: 0.6,
      ease: 'easeOut',
      onUpdate: (latest) => {
        setDisplayValue(latest);
      },
    });
    prevValueRef.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <span className={className}>
      {displayValue.toFixed(fractionDigits)}
    </span>
  );
};
