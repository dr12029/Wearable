import React, { useRef, useEffect, useState } from 'react';
import { EcgPoint } from '../types';
import { AppColors } from '../utils/theme';

interface EcgChartWidgetProps {
  ecgBuffer: EcgPoint[];
}

export const EcgChartWidget: React.FC<EcgChartWidgetProps> = ({ ecgBuffer }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 140 });

  // Dynamically watch container size so that we never draw fixed pixel widths (Responsive Design compliance)
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ 
          width: width || 400, 
          height: height || 140 
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const { width, height } = dimensions;

  // Let's draw the svg path representing the 400 points
  const points = ecgBuffer;
  const numPoints = points.length;

  let pathData = '';

  const yMin = -0.4;
  const yMax = 1.2;
  const ySpan = yMax - yMin;

  if (numPoints > 1) {
    for (let i = 0; i < numPoints; i++) {
      const p = points[i];
      const x = (i / (numPoints - 1)) * width;

      // Normalise and invert Y axis (SVG starts with 0 at the top)
      const normalizedY = (p.value - yMin) / ySpan;
      const clampedY = Math.max(0, Math.min(1, normalizedY));
      const y = (1 - clampedY) * height;

      if (i === 0) {
        pathData += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        pathData += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
      }
    }
  }

  // Draw thin zero line. Where is value=0?
  const zeroNormalizedY = (0 - yMin) / ySpan;
  const zeroY = (1 - zeroNormalizedY) * height;

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[140px] bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden select-none"
    >
      <svg 
         className="w-full h-full block" 
         width={width} 
         height={height}
      >
        {/* Dash zero-line grid */}
        <line
          x1="0"
          y1={zeroY}
          x2={width}
          y2={zeroY}
          stroke={AppColors.borderDim}
          strokeWidth="1.2"
          strokeDasharray="4 4"
        />

        {/* Waveform line */}
        {pathData && (
          <path
            d={pathData}
            fill="none"
            stroke={AppColors.ecgLine}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="transition-all duration-75"
          />
        )}
      </svg>

      {/* Grid Overlay Detail */}
      <span className="absolute bottom-2 right-3 font-mono text-[8px] text-slate-400 font-bold uppercase tracking-wider">
        LEAD I • 200HZ • ACTIVE
      </span>

      {/* Fading left cover for trace arrival */}
      <div 
        className="absolute top-0 bottom-0 left-0 w-8 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(to right, #F8FAFC 0%, rgba(248,250,252,0) 100%)'
        }}
      />
    </div>
  );
};

