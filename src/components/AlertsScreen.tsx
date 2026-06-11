import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertEvent } from '../types';
import { AppColors } from '../utils/theme';
import { Thresholds } from '../utils/thresholds';

interface AlertsScreenProps {
  alerts: AlertEvent[];
  onClearAlerts?: () => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({ alerts, onClearAlerts }) => {
  const formatTime = (date: Date) => {
    const hrs = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    const secs = String(date.getSeconds()).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const getAlertLabel = (type: string) => {
    switch (type) {
      case 'fall':
        return 'MOTION ALERT • IMPACT DETECTED';
      case 'bpmHigh':
        return 'ANOMALY ALERT • TACHYCARDIA';
      case 'bpmLow':
        return 'ANOMALY ALERT • BRADYCARDIA';
      case 'spo2Low':
        return 'SYSTEM ALERT • HYPOXIA VENT';
      case 'tempHigh':
        return 'BIOMETRIC ALERT • CORE PYREXIA';
      case 'tempLow':
        return 'BIOMETRIC ALERT • HYPOTHERMIA';
      default:
        return 'DIAGNOSTIC EVENT • SYSTEM WARN';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 text-left" style={{ backgroundColor: AppColors.bgPrimary }}>
      {/* AppBar style header */}
      <div className="flex items-center justify-between px-5 py-4 border-b select-none bg-white" style={{ borderColor: AppColors.borderDim }}>
        <div>
          <h1 className="font-sans text-xs tracking-widest font-black text-slate-800 uppercase">
            ALERTS FEED ARCHIVE
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Active Biomedical Feeds
          </p>
        </div>
        
        {alerts.length > 0 && onClearAlerts && (
          <button 
            onClick={onClearAlerts}
            className="font-sans text-[10px] font-black border text-slate-500 bg-slate-50 hover:bg-rose-600 hover:text-white hover:border-rose-600 px-3 py-1.5 duration-100 rounded-full uppercase cursor-pointer outline-none"
            style={{ borderColor: AppColors.borderDim }}
          >
            Flush Feeds
          </button>
        )}
      </div>

      {/* Main scrolling list container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        <AnimatePresence mode="popLayout">
          {alerts.length === 0 ? (
            // Blinking empty state
            <motion.div
              key="empty-state"
              className="bg-white rounded-[24px] border p-8 flex flex-col items-center justify-center text-center select-none shadow-sm"
              style={{ borderColor: AppColors.borderDim }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {/* Pulsing Green Circle */}
              <motion.div 
                className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-2xl font-bold mb-4 border border-emerald-100"
                animate={{ scale: [1.0, 1.05, 1.0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: 'easeInOut'
                }}
              >
                💚
              </motion.div>
              
              <h2 className="font-sans text-[11px] tracking-widest text-slate-800 font-black uppercase mb-1">
                ALL SYSTEMS OPERATIONAL
              </h2>
              
              <p className="font-sans text-xs text-slate-400 font-bold uppercase tracking-wide mt-1 max-w-xs leading-normal">
                Biometric levels operating perfectly within safe parameters
              </p>
            </motion.div>
          ) : (
            // Action Alert tiles
            alerts.map((alert) => {
              const severityColor = alert.severity === 'critical' ? AppColors.crit : AppColors.warn;
              const bgBadge = alert.severity === 'critical' ? 'bg-rose-50' : 'bg-amber-50';

              return (
                <motion.div
                  key={alert.id}
                  layoutId={alert.id}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="overflow-hidden border bg-white rounded-2xl shadow-sm hover:shadow-md duration-150"
                  style={{ borderColor: AppColors.borderDim }}
                >
                  <div className="flex w-full items-stretch relative min-h-[64px]">
                    {/* Left Accent indicator strip */}
                    <div 
                      className="w-1.5 shrink-0" 
                      style={{ backgroundColor: severityColor }}
                    />

                    {/* Alert summary card */}
                    <div className="flex-1 py-4 px-5 flex flex-row items-center gap-4 justify-between">
                      <div className="flex-1 flex flex-col min-w-0">
                        {/* Upper uppercase bold metadata */}
                        <span 
                          className="font-sans text-[10px] font-black tracking-widest block"
                          style={{ color: severityColor }}
                        >
                          {getAlertLabel(alert.type)}
                        </span>
                        
                        {/* Summary description */}
                        <p className="font-sans text-[13px] text-slate-700 font-medium leading-relaxed mt-1 select-text">
                          {alert.message}
                        </p>
                      </div>

                      {/* Right timestamp stamp */}
                      <div className="flex flex-col items-end gap-1 shrink-0 self-center">
                        <span className="font-mono text-[10px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                          {formatTime(alert.timestamp)}
                        </span>
                        <span className="font-sans text-[8px] text-slate-400 font-black tracking-wider uppercase">
                          {alert.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Grid pattern status decoration in bottom foot */}
      <div className="px-5 py-3 border-t font-sans text-[9px] text-slate-400 font-black tracking-widest flex justify-between select-none bg-white uppercase" style={{ borderColor: AppColors.borderDim }}>
        <span>Feed Sync • Live Streams</span>
        <span className="text-slate-500 font-black">Feed Length: {alerts.length} Items</span>
      </div>
    </div>
  );
};

