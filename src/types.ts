export type AlertSeverity = 'critical' | 'warning';

export type AlertType = 'bpmHigh' | 'bpmLow' | 'spo2Low' | 'tempHigh' | 'tempLow' | 'fall';

export interface VitalsData {
  bpm: number;
  spo2: number;
  temp: number;
  fallDetected: boolean;
  deviceOnline: boolean;
  timestamp: Date;
}

export interface EcgPoint {
  value: number; // roughly -0.35 to 1.1
  timestamp: number; // Timestamp of generation or offset
}

export interface AlertEvent {
  id: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  timestamp: Date;
  read?: boolean;
}

export interface HistoryPoint {
  time: Date;
  value: number;
}

export type VitalStatus = 'ok' | 'warning' | 'critical';
