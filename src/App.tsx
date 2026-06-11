import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  TriangleAlert, 
  Activity, 
  X,
  Volume2,
  VolumeX
} from 'lucide-react';

import { VitalsData, EcgPoint, AlertEvent, HistoryPoint } from './types';
import { FakeDataEngine } from './fakeDataEngine';
import { AppColors } from './utils/theme';

// Import our modular screens & sub-widgets
import { DashboardScreen } from './components/DashboardScreen';
import { AlertsScreen } from './components/AlertsScreen';
import { HistoryScreen } from './components/HistoryScreen';

interface ActiveToast {
  id: string;
  message: string;
  severity: 'critical' | 'warning';
}

export default function App() {
  const engineRef = useRef<FakeDataEngine | null>(null);

  // Core biometric feeds
  const [latestVitals, setLatestVitals] = useState<VitalsData>({
    bpm: 72,
    spo2: 98.0,
    temp: 36.7,
    fallDetected: false,
    deviceOnline: true,
    timestamp: new Date(),
  });

  const [ecgBuffer, setEcgBuffer] = useState<EcgPoint[]>([]);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Historical stores
  const [bpmHistory, setBpmHistory] = useState<HistoryPoint[]>([]);
  const [spo2History, setSpo2History] = useState<HistoryPoint[]>([]);
  const [tempHistory, setTempHistory] = useState<HistoryPoint[]>([]);

  // HUD Warnings state
  const [activeToast, setActiveToast] = useState<ActiveToast | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Initialize data simulator once on mount
  useEffect(() => {
    const engine = new FakeDataEngine();
    engineRef.current = engine;

    // Prefill histories
    setBpmHistory(engine.bpmHistory);
    setSpo2History(engine.spo2History);
    setTempHistory(engine.tempHistory);
    setEcgBuffer(engine.ecgBuffer);

    // Callbacks binding telemetry changes to React State
    engine.onVitals = (data: VitalsData) => {
      setLatestVitals(data);
      
      // Keep state histories matching engine historical lists
      setBpmHistory(engine.bpmHistory);
      setSpo2History(engine.spo2History);
      setTempHistory(engine.tempHistory);
    };

    engine.onEcgSampleBatch = (newPoints) => {
      // Direct high-performance buffer synchronization
      setEcgBuffer(engine.ecgBuffer);
    };

    engine.onAlert = (alertEvent: AlertEvent) => {
      // Append newest alert first
      setAlerts((prev) => [alertEvent, ...prev].slice(0, 20));

      // Trigger standard HTML5 vibrate thread for physical device feedback (Haptic vibration)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (alertEvent.severity === 'critical') {
          navigator.vibrate([150, 60, 150]);
        } else {
          navigator.vibrate([80]);
        }
      }

      // Display dynamic temporary on-screen HUD Warning toast
      setActiveToast({
        id: alertEvent.id,
        message: alertEvent.message,
        severity: alertEvent.severity,
      });

      // Sound retro alert beep if audio is unmuted
      if (!isAudioMuted && typeof window !== 'undefined') {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioCtx) {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(alertEvent.severity === 'critical' ? 880 : 440, audioCtx.currentTime);
          
          gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
          
          osc.start();
          osc.stop(audioCtx.currentTime + 0.4);
        }
      }
    };

    engine.start();

    return () => {
      engine.stop();
    };
  }, [isAudioMuted]);

  // Auto-dismiss popup HUD warning after 4.5 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timeout = setTimeout(() => {
      setActiveToast(null);
    }, 4500);
    return () => clearTimeout(timeout);
  }, [activeToast]);

  const handleClearAlerts = () => {
    setAlerts([]);
  };

  const handleTriggerAnomalyManual = (type: string) => {
    if (engineRef.current) {
      engineRef.current.triggerAnomalyManual(type);
    }
  };

  // Determine if any critical warnings are actively flagged
  const hasActiveCritical = latestVitals.fallDetected || latestVitals.bpm > 130 || latestVitals.bpm < 45 || latestVitals.spo2 < 92 || latestVitals.temp > 38.0;

  return (
    <div className="min-h-screen text-slate-800 font-sans flex items-center justify-center relative p-0 overflow-y-auto" style={{ backgroundColor: '#F1F5F9' }}>
      {/* Background ambient lighting and grid details */}
      <div className="absolute inset-0 nothing-dot-grid pointer-events-none select-none opacity-20" />

      {/* Main smartphone frame wrapper simulating premium bento dashboard */}
      <div 
        className="w-full max-w-md min-h-screen sm:min-h-[820px] sm:max-h-[860px] sm:rounded-[40px] sm:border-8 border-none bg-white overflow-hidden shadow-2xl relative flex flex-col items-stretch"
        style={{ 
          borderColor: '#E2E8F0',
          height: '100%',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)'
        }}
      >
        {/* Dynamic Warning Toast Banner */}
        <AnimatePresence>
          {activeToast && (
            <motion.div
              initial={{ y: -90, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -90, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="absolute top-4 left-4 right-4 z-50 p-4 border rounded-2xl select-none shadow-lg bg-white"
              style={{
                borderColor: activeToast.severity === 'critical' ? AppColors.crit : AppColors.warn,
                boxShadow: activeToast.severity === 'critical' 
                  ? '0 12px 24px rgba(239, 68, 68, 0.15)' 
                  : '0 8px 16px rgba(245, 158, 11, 0.1)',
              }}
            >
              <div className="flex items-start gap-3 justify-between">
                <div className="flex-1 text-left">
                  <span 
                    className="font-sans text-[8px] font-black tracking-widest uppercase block leading-none"
                    style={{ color: activeToast.severity === 'critical' ? AppColors.crit : AppColors.warn }}
                  >
                    {activeToast.severity === 'critical' ? '⚠️ CRITICAL TELEMETRY ALERT' : '⚠️ WARNING THRESHOLD'}
                  </span>
                  <p className="font-sans text-xs text-slate-700 mt-1 select-text leading-tight font-bold">
                    {activeToast.message}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveToast(null)}
                  className="p-1 text-slate-300 hover:text-slate-600 transition-colors duration-100 cursor-pointer rounded-full"
                >
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio Mute toggle on outer layer of the simulated screen */}
        <div className="hidden sm:block absolute right-7 top-6 z-35 select-none">
          <button 
            type="button"
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors duration-150 p-1 bg-slate-50 border border-slate-100 rounded-full w-7 h-7 flex items-center justify-center shadow-sm"
            title={isAudioMuted ? 'Unmute alerts' : 'Mute alerts'}
          >
            {isAudioMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
        </div>

        {/* Screen Viewport switcher */}
        <div className="flex-1 overflow-x-hidden min-h-0 relative bg-slate-50" style={{ backgroundColor: AppColors.bgPrimary }}>
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div
                key="tab-dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <DashboardScreen 
                  latestVitals={latestVitals}
                  ecgBuffer={ecgBuffer}
                  onTriggerAnomaly={handleTriggerAnomalyManual}
                  hasActiveCritical={hasActiveCritical}
                />
              </motion.div>
            )}

            {activeTab === 1 && (
              <motion.div
                key="tab-alerts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <AlertsScreen 
                  alerts={alerts}
                  onClearAlerts={handleClearAlerts}
                />
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div
                key="tab-history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full"
              >
                <HistoryScreen 
                  bpmHistory={bpmHistory}
                  spo2History={spo2History}
                  tempHistory={tempHistory}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom tab navigator styled in premium Bento guidelines */}
        <div 
          className="h-16 shrink-0 border-t flex flex-row items-stretch select-none bg-white"
          style={{
            borderColor: AppColors.borderDim,
          }}
        >
          {/* Tab 0: Dashboard */}
          <button
            onClick={() => setActiveTab(0)}
            className="flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer outline-none transition-colors duration-200"
            style={{
              color: activeTab === 0 ? AppColors.accent : AppColors.textTertiary,
            }}
          >
            <LayoutGrid size={18} strokeWidth={activeTab === 0 ? 2.5 : 1.8} />
            <span className="font-sans text-[8px] font-black tracking-widest leading-none uppercase mt-0.5">
              Dashboard
            </span>
          </button>

          {/* Tab 1: Alerts log list */}
          <button
            onClick={() => setActiveTab(1)}
            className="flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer outline-none transition-colors duration-200 relative"
            style={{
              color: activeTab === 1 ? AppColors.accent : AppColors.textTertiary,
            }}
          >
            <div className="relative">
              <TriangleAlert size={18} strokeWidth={activeTab === 1 ? 2.5 : 1.8} />
              {/* Unread alert indicator dot */}
              {alerts.length > 0 && activeTab !== 1 && (
                <span 
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full block animate-ping"
                  style={{ backgroundColor: AppColors.crit }}
                />
              )}
            </div>
            <span className="font-sans text-[8px] font-black tracking-widest leading-none uppercase mt-0.5">
              Alerts FEED
            </span>
          </button>

          {/* Tab 2: History chart list */}
          <button
            onClick={() => setActiveTab(2)}
            className="flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer outline-none transition-colors duration-200"
            style={{
              color: activeTab === 2 ? AppColors.accent : AppColors.textTertiary,
            }}
          >
            <Activity size={18} strokeWidth={activeTab === 2 ? 2.5 : 1.8} />
            <span className="font-sans text-[8px] font-black tracking-widest leading-none uppercase mt-0.5">
              History
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
