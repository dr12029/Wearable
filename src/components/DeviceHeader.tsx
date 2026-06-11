import React, { useState, useEffect } from 'react';
import { StatusLed } from './StatusLed';
import { AppColors } from '../utils/theme';

interface DeviceHeaderProps {
  deviceOnline: boolean;
  hasActiveCritical: boolean;
}

export const DeviceHeader: React.FC<DeviceHeaderProps> = ({ 
  deviceOnline, 
  hasActiveCritical 
}) => {
  const [timeText, setTimeText] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setTimeText(`${hrs}:${mins}:${secs}`);
    };

    updateTime(); // initial run
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // LED state calculation
  let ledState: 'online' | 'offline' | 'alert' = 'online';
  if (!deviceOnline) ledState = 'offline';
  else if (hasActiveCritical) ledState = 'alert';

  return (
    <div className="flex items-center justify-between py-2 border-b select-none pb-4 mb-4" style={{ borderColor: AppColors.borderDim }}>
      {/* Device descriptor */}
      <div className="flex items-center gap-3">
        <StatusLed status={ledState} />
        <div>
          <h2 className="text-sm font-bold tracking-tight text-slate-800 uppercase flex items-center gap-2">
            Wearable-Link 
            <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
              WBL-01
            </span>
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Biomedical Telemetry Core
          </p>
        </div>
      </div>

      {/* Real-time ticker and status badge */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">System Status</span>
          <span className="text-xs font-bold text-emerald-600">Optimum Feed</span>
        </div>
        <div className="bg-slate-100 px-3 py-1.5 rounded-full flex items-center justify-center border border-slate-200">
          <span 
            className="font-mono text-xs font-extrabold tracking-widest"
            style={{ color: AppColors.textPrimary }}
          >
            {timeText || '00:00:00'}
          </span>
        </div>
      </div>
    </div>
  );
};

