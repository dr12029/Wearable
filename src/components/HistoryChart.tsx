import React, { useRef, useState, useEffect } from 'react';
import { HistoryPoint } from '../types';
import { AppColors } from '../utils/theme';
import { Thresholds } from '../utils/thresholds';

interface HistoryChartProps {
  data: HistoryPoint[];
  metricType: 'bpm' | 'spo2' | 'temp';
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ data, metricType }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 260 });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Resize listener
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({
          width: width || 500,
          height: height || 260,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { width, height } = dimensions;

  // Render padding
  const padding = { top: 25, right: 20, bottom: 35, left: 45 };

  if (!data || data.length === 0) {
    return (
      <div className="h-[260px] flex items-center justify-center font-sans text-xs text-slate-400 font-bold uppercase tracking-wider">
        NO HISTORICAL TELEMETRY FOUND
      </div>
    );
  }

  // Calculate limits
  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  
  // Create comfortable vertical margins
  const valueDelta = maxVal - minVal;
  const marginFactor = valueDelta === 0 ? 5 : valueDelta * 0.15;
  const yMin = Math.max(0, minVal - marginFactor);
  const yMax = maxVal + marginFactor;
  const ySpan = yMax - yMin;

  // Map coordinate helpers
  const getX = (index: number) => {
    const totalPoints = data.length;
    const chartWidth = width - padding.left - padding.right;
    return padding.left + (index / (totalPoints - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const chartHeight = height - padding.top - padding.bottom;
    const normalizedY = (val - yMin) / (ySpan || 1);
    return padding.top + (1 - normalizedY) * chartHeight;
  };

  // Build stroke lines and polygon area wraps
  let linePath = '';
  let areaPath = '';

  const chartHeight = height - padding.top - padding.bottom;
  const zeroYPos = padding.top + chartHeight; // bottom of the chart

  if (data.length > 0) {
    data.forEach((point, idx) => {
      const x = getX(idx);
      const y = getY(point.value);

      if (idx === 0) {
        linePath += `M ${x} ${y}`;
        areaPath += `M ${x} ${zeroYPos} L ${x} ${y}`;
      } else {
        linePath += ` L ${x} ${y}`;
        areaPath += ` L ${x} ${y}`;
      }

      if (idx === data.length - 1) {
        areaPath += ` L ${x} ${zeroYPos} Z`;
      }
    });
  }

  // Determine colors based on metric configurations
  let metricColor = AppColors.ok;
  let unit = '';
  if (metricType === 'bpm') {
    const avgVal = values.reduce((s, c) => s + c, 0) / values.length;
    metricColor = Thresholds.getStatusColor(Thresholds.bpmStatus(avgVal));
    unit = 'BPM';
  } else if (metricType === 'spo2') {
    const avgVal = values.reduce((s, c) => s + c, 0) / values.length;
    metricColor = Thresholds.getStatusColor(Thresholds.spo2Status(avgVal));
    unit = '%';
  } else if (metricType === 'temp') {
    const avgVal = values.reduce((s, c) => s + c, 0) / values.length;
    metricColor = Thresholds.getStatusColor(Thresholds.tempStatus(avgVal));
    unit = '°C';
  }

  // Format tick timestamps
  const formatTime = (d: Date) => {
    const hrs = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hrs}:${mins}`;
  };

  const getHoverItemIndex = (clientX: number) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const xPos = clientX - rect.left - padding.left;
    const chartWidth = width - padding.left - padding.right;
    const percentage = xPos / chartWidth;
    
    if (percentage < 0 || percentage > 1) return null;

    const matchedIndex = Math.round(percentage * (data.length - 1));
    return Math.max(0, Math.min(data.length - 1, matchedIndex));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const matched = getHoverItemIndex(e.clientX);
    setHoverIndex(matched);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches && e.touches[0]) {
      const matched = getHoverItemIndex(e.touches[0].clientX);
      setHoverIndex(matched);
    }
  };

  const hoveredPoint = hoverIndex !== null ? data[hoverIndex] : null;

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[260px] rounded-2xl border bg-slate-50/50 p-1 overflow-visible"
      style={{ borderColor: AppColors.borderDim }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverIndex(null)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setHoverIndex(null)}
    >
      {/* Background Dot Matrix Grid in boundaries */}
      <div className="absolute inset-0 nothing-dot-grid pointer-events-none opacity-[0.2]" />

      <svg className="w-full h-full block overflow-visible z-10 relative">
        {/* Gradients */}
        <defs>
          <linearGradient id={`gradient-${metricType}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={metricColor} stopOpacity={0.16} />
            <stop offset="100%" stopColor={metricColor} stopOpacity={0.00} />
          </linearGradient>
        </defs>

        {/* Horizontal grid ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const graphHeight = height - padding.top - padding.bottom;
          const y = padding.top + ratio * graphHeight;
          return (
            <line
              key={ratio}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke={AppColors.borderDim}
              strokeWidth="0.8"
              strokeDasharray="2 3"
            />
          );
        })}

        {/* Plot Filled Polygon Area */}
        {areaPath && (
          <path
            d={areaPath}
            fill={`url(#gradient-${metricType})`}
            className="transition-all duration-300"
          />
        )}

        {/* Plot Active Line Stroke */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={metricColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        )}

        {/* Y Axis min/max text labels */}
        <text
          x={padding.left - 10}
          y={getY(yMax) + 4}
          fill={AppColors.textSecondary}
          className="font-mono text-[9px] font-bold text-right"
          textAnchor="end"
        >
          {yMax.toFixed(metricType === 'temp' ? 1 : 0)}
        </text>
        <text
          x={padding.left - 10}
          y={getY(yMin) - 2}
          fill={AppColors.textSecondary}
          className="font-mono text-[9px] font-bold text-right"
          textAnchor="end"
        >
          {yMin.toFixed(metricType === 'temp' ? 1 : 0)}
        </text>

        {/* X Axis boundaries time timestamps */}
        {data.length > 5 && (
          <>
            <text
              x={getX(0)}
              y={height - padding.bottom + 16}
              fill={AppColors.textSecondary}
              className="font-mono text-[8.5px] font-bold"
              textAnchor="start"
            >
              {formatTime(data[0].time)}
            </text>
            <text
              x={getX(Math.floor(data.length / 2))}
              y={height - padding.bottom + 16}
              fill={AppColors.textSecondary}
              className="font-mono text-[8.5px] font-bold"
              textAnchor="middle"
            >
              {formatTime(data[Math.floor(data.length / 2)].time)}
            </text>
            <text
              x={getX(data.length - 1)}
              y={height - padding.bottom + 16}
              fill={AppColors.textSecondary}
              className="font-mono text-[8.5px] font-bold"
              textAnchor="end"
            >
              {formatTime(data[data.length - 1].time)}
            </text>
          </>
        )}

        {/* Interactivity Hover tooltip details overlay */}
        {hoverIndex !== null && hoveredPoint && (
          <>
            {/* Hover vertical laser line */}
            <line
              x1={getX(hoverIndex)}
              y1={padding.top}
              x2={getX(hoverIndex)}
              y2={height - padding.bottom}
              stroke={AppColors.textSecondary}
              strokeWidth="1"
              strokeDasharray="2 2"
            />

            {/* Hover circle bullet */}
            <circle
              cx={getX(hoverIndex)}
              cy={getY(hoveredPoint.value)}
              r="4.5"
              fill="#ffffff"
              stroke={metricColor}
              strokeWidth="2.5"
            />
          </>
        )}
      </svg>

      {/* Numerical hover HUD display popup overlay inside the box */}
      {hoverIndex !== null && hoveredPoint && (
        <div 
          className="absolute z-30 px-3.5 py-2 rounded-xl border pointer-events-none select-none flex flex-col items-center gap-0.5 bg-slate-900 border-slate-800 shadow-md"
          style={{
            // Place tooltip dynamically on left or right of target point to avoid clipping at edges
            top: `${padding.top}px`,
            left: getX(hoverIndex) > width / 2 
              ? `${getX(hoverIndex) - 130}px` 
              : `${getX(hoverIndex) + 20}px`
          }}
        >
          <span className="font-sans text-[8px] text-slate-400 font-extrabold tracking-widest uppercase">
            {formatTime(hoveredPoint.time)} UTCTime
          </span>
          <span className="font-mono text-sm font-extrabold text-white leading-none">
            {hoveredPoint.value.toFixed(metricType === 'bpm' ? 0 : 1)} {unit}
          </span>
        </div>
      )}
    </div>
  );
};

