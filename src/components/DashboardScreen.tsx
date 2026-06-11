import React from 'react';
import { DeviceHeader } from './DeviceHeader';
import { BpmCard } from './BpmCard';
import { Spo2Card } from './Spo2Card';
import { TempCard } from './TempCard';
import { FallCard } from './FallCard';
import { EcgPanel } from './EcgPanel';
import { MetricLabel } from './MetricLabel';
import { VitalsData, EcgPoint } from '../types';
import { AppColors } from '../utils/theme';

interface DashboardScreenProps {
  latestVitals: VitalsData;
  ecgBuffer: EcgPoint[];
  onTriggerAnomaly: (type: string) => void;
  hasActiveCritical: boolean;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  latestVitals,
  ecgBuffer,
  onTriggerAnomaly,
  hasActiveCritical,
}) => {
  const anomaliesList = [
    { id: 'fall', label: 'FORCE FALL' },
    { id: 'bpm_high', label: 'TACHYCARDIA' },
    { id: 'bpm_low', label: 'BRADYCARDIA' },
    { id: 'spo2_low', label: 'HYPOXIA' },
    { id: 'temp_high', label: 'HIGH CORE' },
  ];

  return (
    <div className="p-5 flex flex-col gap-4 min-h-0 overflow-y-auto pb-16 select-none text-left" style={{ backgroundColor: AppColors.bgPrimary }}>
      {/* 1. Device Header with connection LED indicator and clock ticker */}
      <DeviceHeader 
        deviceOnline={latestVitals.deviceOnline} 
        hasActiveCritical={hasActiveCritical} 
      />

      {/* 2. Responsive 2x2 grid containing the biometrics */}
      <div className="grid grid-cols-2 gap-4">
        <BpmCard bpm={latestVitals.bpm} />
        <Spo2Card spo2={latestVitals.spo2} />
        <TempCard temp={latestVitals.temp} />
        <FallCard fallDetected={latestVitals.fallDetected} />
      </div>

      {/* 3. Live 200Hz ECG Waveform Scope */}
      <EcgPanel ecgBuffer={ecgBuffer} />

      {/* 4. Interactive Simulation Playground Card */}
      <div 
        className="border border-dashed rounded-[24px] p-5 text-left bg-white shadow-sm"
        style={{ borderColor: AppColors.borderBase }}
      >
        <div className="mb-3">
          <MetricLabel text="SIMULATION GENERATOR" />
          <span className="font-sans text-[10px] text-slate-400 font-bold block mt-1 uppercase tracking-wider">
            Manually trigger specific body states to verify real-time alerts & LED warning pulses.
          </span>
        </div>

        {/* Action Triggers */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
          {anomaliesList.map((anom) => (
            <button
              key={anom.id}
              onClick={() => onTriggerAnomaly(anom.id)}
              className="font-sans text-[9px] font-black tracking-widest border text-slate-500 bg-slate-50 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 rounded-full py-2 duration-150 ease-out cursor-pointer uppercase select-none outline-none text-center"
              style={{ borderColor: AppColors.borderDim }}
            >
              ⚡ {anom.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

