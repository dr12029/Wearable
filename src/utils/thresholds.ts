import { VitalStatus } from '../types';

export class Thresholds {
  static bpmStatus(bpm: number): VitalStatus {
    if (bpm < 45 || bpm > 130) return 'critical';
    if (bpm < 50 || bpm > 110) return 'warning';
    return 'ok';
  }

  static spo2Status(spo2: number): VitalStatus {
    if (spo2 < 92) return 'critical';
    if (spo2 < 95) return 'warning';
    return 'ok';
  }

  static tempStatus(temp: number): VitalStatus {
    if (temp > 38.0 || temp < 35.5) return 'critical';
    if (temp > 37.5 || temp < 36.0) return 'warning';
    return 'ok';
  }

  static getStatusColor(status: VitalStatus | 'neutral'): string {
    switch (status) {
      case 'ok':
        return '#30FF6B'; // neon green
      case 'warning':
        return '#FFB800'; // orange
      case 'critical':
        return '#FF3B30'; // red
      case 'neutral':
      default:
        return '#888888'; // gray
    }
  }

  static getStatusBgColor(status: VitalStatus | 'neutral'): string {
    switch (status) {
      case 'ok':
        return 'rgba(48, 255, 107, 0.08)';
      case 'warning':
        return 'rgba(255, 184, 0, 0.08)';
      case 'critical':
        return 'rgba(255, 59, 48, 0.08)';
      case 'neutral':
      default:
        return 'rgba(136, 136, 136, 0.08)';
    }
  }
}
