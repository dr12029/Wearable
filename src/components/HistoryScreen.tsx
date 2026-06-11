import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HistoryPoint } from '../types';
import { HistoryChart } from './HistoryChart';
import { AppColors } from '../utils/theme';

interface HistoryScreenProps {
  bpmHistory: HistoryPoint[];
  spo2History: HistoryPoint[];
  tempHistory: HistoryPoint[];
}

type MetricTab = 'bpm' | 'spo2' | 'temp';

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  bpmHistory,
  spo2History,
  tempHistory,
}) => {
  const [activeTab, setActiveTab] = useState<MetricTab>('bpm');

  const getActiveHistory = (): HistoryPoint[] => {
    switch (activeTab) {
      case 'bpm':
        return bpmHistory;
      case 'spo2':
        return spo2History;
      case 'temp':
        return tempHistory;
    }
  };

  const getActiveTitle = () => {
    switch (activeTab) {
      case 'bpm':
        return 'BIOPULSE TREND • HEART RATE';
      case 'spo2':
        return 'RESPIRATORY TREND • OXYGEN SAT';
      case 'temp':
        return 'THERMOGENESIS TREND • BODY TEMP';
    }
  };

  const tabs: { id: MetricTab; label: string }[] = [
    { id: 'bpm', label: 'Heart Rate' },
    { id: 'spo2', label: 'Blood Oxygen' },
    { id: 'temp', label: 'Temperature' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-100 text-left" style={{ backgroundColor: AppColors.bgPrimary }}>
      {/* AppBar style header */}
      <div className="px-5 py-4 border-b select-none bg-white" style={{ borderColor: AppColors.borderDim }}>
        <h1 className="font-sans text-xs tracking-widest font-black text-slate-800 uppercase">
          METRICS HISTORY FEED
        </h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
          Longitudinal Telemetry Analysis
        </p>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* TabRow : Capsule segment controller */}
        <div className="flex bg-slate-200/50 p-1 rounded-full select-none relative z-10 w-full border border-slate-200/30">
          {tabs.map((tab) => {
            const isSelected = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 font-sans text-[10px] font-black tracking-widest text-center cursor-pointer py-2.5 relative outline-none border-none transition-colors duration-150 uppercase"
                style={{
                  color: isSelected ? AppColors.accent : AppColors.textSecondary,
                }}
              >
                <span className="relative z-25">{tab.label}</span>

                {/* Sliding Capsule Fill */}
                {isSelected && (
                  <motion.div
                    layoutId="historyTabUnderline"
                    className="absolute inset-0 bg-white shadow-sm rounded-full -z-10 border border-slate-100"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic description of the metric */}
        <div className="flex items-center justify-between select-none px-1">
          <span className="font-sans text-[10px] font-black tracking-widest text-slate-400">
            {getActiveTitle()}
          </span>
          <span className="font-sans text-[9px] text-slate-400 font-bold tracking-widest uppercase">
            90 POINT SNAPSHOT
          </span>
        </div>

        {/* History Chart with Crossfade Switcher */}
        <div className="flex-1 min-h-[260px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="w-full h-full"
            >
              <HistoryChart data={getActiveHistory()} metricType={activeTab} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Legend display block */}
        <div 
          className="border rounded-[24px] p-5 select-none flex flex-row items-center gap-6 justify-between text-[10px] font-sans bg-white shadow-sm"
          style={{ borderColor: AppColors.borderDim }}
        >
          <div>
            <span className="text-slate-400 block font-black uppercase tracking-wider text-[8.5px]">AVG EVAL</span>
            <span className="text-slate-800 font-extrabold text-xs block mt-0.5">
              {activeTab === 'bpm' && `${Math.round(bpmHistory.reduce((s, c) => s + c.value, 0) / (bpmHistory.length || 1))} BPM`}
              {activeTab === 'spo2' && `${(spo2History.reduce((s, c) => s + c.value, 0) / (spo2History.length || 1)).toFixed(1)}%`}
              {activeTab === 'temp' && `${(tempHistory.reduce((s, c) => s + c.value, 0) / (tempHistory.length || 1)).toFixed(1)}°C`}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div>
            <span className="text-slate-400 block font-black uppercase tracking-wider text-[8.5px]">MAX PEAK</span>
            <span className="text-indigo-600 font-extrabold text-xs block mt-0.5">
              {activeTab === 'bpm' && `${Math.round(Math.max(...bpmHistory.map(b => b.value)))} BPM`}
              {activeTab === 'spo2' && `${Math.max(...spo2History.map(s => s.value)).toFixed(1)}%`}
              {activeTab === 'temp' && `${Math.max(...tempHistory.map(t => t.value)).toFixed(1)}°C`}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-100" />
          <div>
            <span className="text-slate-400 block font-black uppercase tracking-wider text-[8.5px]">INTERVAL</span>
            <span className="text-emerald-600 font-extrabold text-[11px] block mt-1">2.0s SEC_POLL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

