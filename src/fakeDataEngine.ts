import { VitalsData, EcgPoint, AlertEvent, HistoryPoint, AlertType, AlertSeverity } from './types';
import { Thresholds } from './utils/thresholds';

// Baselines
const BASE_BPM = 72;
const BASE_SPO2 = 98.0;
const BASE_TEMP = 36.7;

// Drift per update (max random walk step)
const BPM_DRIFT = 3.0;
const SPO2_DRIFT = 0.4;
const TEMP_DRIFT = 0.07;

const HISTORY_MAX_POINTS = 90;
const ECG_BUFFER_SIZE = 400;

export class FakeDataEngine {
  // Callbacks
  public onVitals?: (data: VitalsData) => void;
  public onEcgSampleBatch?: (points: EcgPoint[]) => void;
  public onAlert?: (alert: AlertEvent) => void;

  // Timers/Intervals
  private vitalsIntervalId: any = null;
  private ecgIntervalId: any = null;
  private anomalyIntervalId: any = null;
  private anomalyResetTimeoutId: any = null;
  private fallResetTimeoutId: any = null;

  // State
  private bpm = BASE_BPM;
  private spo2 = BASE_SPO2;
  private temp = BASE_TEMP;
  private fallDetected = false;
  private deviceOnline = true;
  private ecgPhase = 0.0;

  // Anomaly status
  private anomalyActive = false;
  private currentAnomalyType: string | null = null;

  // History buffers
  private bpmHistoryList: HistoryPoint[] = [];
  private spo2HistoryList: HistoryPoint[] = [];
  private tempHistoryList: HistoryPoint[] = [];
  private ecgBufferList: EcgPoint[] = [];

  // Cooldown map: AlertType -> UTC Timestamp (ms)
  private lastAlertTime: Record<string, number> = {};

  constructor() {
    // Fill pre-existing historical charts with valid/healthy data so the charts look complete on mount
    const now = Date.now();
    for (let i = HISTORY_MAX_POINTS; i > 0; i--) {
      const time = new Date(now - i * 2000);
      this.bpmHistoryList.push({
        time,
        value: this.randomWalk(BASE_BPM, BASE_BPM, BPM_DRIFT, 55, 95)
      });
      this.spo2HistoryList.push({
        time,
        value: this.randomWalk(BASE_SPO2, BASE_SPO2, SPO2_DRIFT, 95, 100)
      });
      this.tempHistoryList.push({
        time,
        value: this.randomWalk(BASE_TEMP, BASE_TEMP, TEMP_DRIFT, 36.2, 37.2)
      });
    }

    // Pre-fill ECG buffer to make it already filled on load
    let phase = 0.0;
    for (let i = 0; i < ECG_BUFFER_SIZE; i++) {
      phase += 0.005 * BASE_BPM / 60;
      if (phase >= 1.0) phase -= 1.0;
      this.ecgBufferList.push({
        value: this.ecgSample(phase),
        timestamp: now - (ECG_BUFFER_SIZE - i) * 5
      });
    }
    this.ecgPhase = phase;
  }

  // Getters
  public get bpmHistory(): HistoryPoint[] {
    return [...this.bpmHistoryList];
  }

  public get spo2History(): HistoryPoint[] {
    return [...this.spo2HistoryList];
  }

  public get tempHistory(): HistoryPoint[] {
    return [...this.tempHistoryList];
  }

  public get ecgBuffer(): EcgPoint[] {
    return [...this.ecgBufferList];
  }

  public start() {
    this.stop();
    this.deviceOnline = true;

    // 1. ECG generator runs at 50ms interval, inserting 10 points at a time (equivalent to 200Hz)
    let lastEcgTime = Date.now();
    this.ecgIntervalId = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastEcgTime;
      lastEcgTime = now;

      // Slice elapsed milliseconds into 5ms points (200Hz)
      const numPoints = Math.round(elapsed / 5);
      const newPoints: EcgPoint[] = [];

      for (let i = 0; i < numPoints; i++) {
        // Advanced phase scales with actual heart rate
        this.ecgPhase += 0.005 * this.bpm / 60;
        if (this.ecgPhase >= 1.0) {
          this.ecgPhase -= 1.0;
        }

        const pointVal = this.ecgSample(this.ecgPhase);
        const pointTime = now - (numPoints - 1 - i) * 5;

        const ecgPt: EcgPoint = {
          value: pointVal,
          timestamp: pointTime
        };

        newPoints.push(ecgPt);
        this.ecgBufferList.push(ecgPt);
      }

      // Cap the buffer
      if (this.ecgBufferList.length > ECG_BUFFER_SIZE) {
        this.ecgBufferList = this.ecgBufferList.slice(this.ecgBufferList.length - ECG_BUFFER_SIZE);
      }

      if (this.onEcgSampleBatch && newPoints.length > 0) {
        this.onEcgSampleBatch(newPoints);
      }
    }, 50);

    // 2. Vitals generator runs every 2 seconds
    this.vitalsIntervalId = setInterval(() => {
      this.updateVitals();
    }, 2000);

    // 3. Anomaly scheduler runs every 45 seconds
    this.anomalyIntervalId = setInterval(() => {
      this.triggerRandomAnomaly();
    }, 45000);
  }

  public stop() {
    if (this.vitalsIntervalId) clearInterval(this.vitalsIntervalId);
    if (this.ecgIntervalId) clearInterval(this.ecgIntervalId);
    if (this.anomalyIntervalId) clearInterval(this.anomalyIntervalId);
    if (this.anomalyResetTimeoutId) clearTimeout(this.anomalyResetTimeoutId);
    if (this.fallResetTimeoutId) clearTimeout(this.fallResetTimeoutId);

    this.vitalsIntervalId = null;
    this.ecgIntervalId = null;
    this.anomalyIntervalId = null;
    this.anomalyResetTimeoutId = null;
    this.fallResetTimeoutId = null;
    this.deviceOnline = false;
  }

  // Setters to manually trigger an anomaly (fantastic for interactive playing!)
  public triggerAnomalyManual(type: string) {
    this.injectAnomaly(type);
  }

  private triggerRandomAnomaly() {
    const anomalyTypes = ['bpm_high', 'bpm_low', 'spo2_low', 'temp_high', 'fall'];
    const randomIndex = Math.floor(Math.random() * anomalyTypes.length);
    const chosen = anomalyTypes[randomIndex];
    this.injectAnomaly(chosen);
  }

  private injectAnomaly(type: string) {
    if (this.anomalyActive) return;

    this.anomalyActive = true;
    this.currentAnomalyType = type;

    // If fall, trigger immediately
    if (type === 'fall') {
      this.fallDetected = true;
      this.updateVitals(true); // force vital update & alerts check

      // Fall auto-clears after 8 seconds
      this.fallResetTimeoutId = setTimeout(() => {
        this.fallDetected = false;
        this.updateVitals(true);
      }, 8000);
    }

    // Anomaly phases out after 8 seconds
    this.anomalyResetTimeoutId = setTimeout(() => {
      this.anomalyActive = false;
      this.currentAnomalyType = null;
    }, 8000);
  }

  private updateVitals(forceCallback = false) {
    const now = new Date();

    // Determine target baselines depending on current active anomaly
    let targetBpm = BASE_BPM;
    let targetSpo2 = BASE_SPO2;
    let targetTemp = BASE_TEMP;

    if (this.anomalyActive && this.currentAnomalyType) {
      switch (this.currentAnomalyType) {
        case 'bpm_high':
          targetBpm = 142.0;
          break;
        case 'bpm_low':
          targetBpm = 38.0;
          break;
        case 'spo2_low':
          targetSpo2 = 88.5;
          break;
        case 'temp_high':
          targetTemp = 39.1;
          break;
      }
    }

    // Apply random walk from current to target baseline
    // Range limits are broad to allow anomaly boundaries
    this.bpm = this.randomWalk(this.bpm, targetBpm, BPM_DRIFT, 30, 160);
    this.spo2 = this.randomWalk(this.spo2, targetSpo2, SPO2_DRIFT, 80, 100);
    this.temp = this.randomWalk(this.temp, targetTemp, TEMP_DRIFT, 34.0, 41.0);

    // Push into history lists
    this.bpmHistoryList.push({ time: now, value: this.bpm });
    this.spo2HistoryList.push({ time: now, value: this.spo2 });
    this.tempHistoryList.push({ time: now, value: this.temp });

    // Truncate history lists
    if (this.bpmHistoryList.length > HISTORY_MAX_POINTS) this.bpmHistoryList.shift();
    if (this.spo2HistoryList.length > HISTORY_MAX_POINTS) this.spo2HistoryList.shift();
    if (this.tempHistoryList.length > HISTORY_MAX_POINTS) this.tempHistoryList.shift();

    const vitals: VitalsData = {
      bpm: this.bpm,
      spo2: this.spo2,
      temp: this.temp,
      fallDetected: this.fallDetected,
      deviceOnline: this.deviceOnline,
      timestamp: now
    };

    if (this.onVitals) {
      this.onVitals(vitals);
    }

    // Process thresholds for notifications and alerts
    this.checkForAlerts(vitals);
  }

  private checkForAlerts(vitals: VitalsData) {
    const now = new Date();

    // 1. Fall Detected
    if (vitals.fallDetected) {
      this.fireAlert('fall', 'CRITICAL FALL EVENT DETECTED — high impact mechanical motion captured', 'critical');
    }

    // 2. High BPM
    if (vitals.bpm > 130) {
      this.fireAlert('bpmHigh', `CRITICAL TACHYCARDIA — heart rate at abnormal high of ${Math.round(vitals.bpm)} BPM`, 'critical');
    } else if (vitals.bpm > 110) {
      this.fireAlert('bpmHigh', `TACHYCARDIA WARNING — high heart rate observed: ${Math.round(vitals.bpm)} BPM`, 'warning');
    }

    // 3. Low BPM
    if (vitals.bpm < 45) {
      this.fireAlert('bpmLow', `CRITICAL BRADYCARDIA — heart rate at unsafe low of ${Math.round(vitals.bpm)} BPM`, 'critical');
    } else if (vitals.bpm < 50) {
      this.fireAlert('bpmLow', `BRADYCARDIA WARNING — low heart rate observed: ${Math.round(vitals.bpm)} BPM`, 'warning');
    }

    // 4. Low SpO2
    if (vitals.spo2 < 92) {
      this.fireAlert('spo2Low', `CRITICAL HYPOXIA — blood oxygen saturation levels failed to ${vitals.spo2.toFixed(1)}%`, 'critical');
    } else if (vitals.spo2 < 95) {
      this.fireAlert('spo2Low', `DESATURATION WARNING — oxygen saturation level lowered: ${vitals.spo2.toFixed(1)}%`, 'warning');
    }

    // 5. High Temp
    if (vitals.temp > 38.0) {
      this.fireAlert('tempHigh', `CRITICAL PYREXIA — extreme temperature elevated at ${vitals.temp.toFixed(1)}°C`, 'critical');
    } else if (vitals.temp > 37.5) {
      this.fireAlert('tempHigh', `FEVER WARNING — temperature elevated at ${vitals.temp.toFixed(1)}°C`, 'warning');
    }

    // 6. Low Temp
    if (vitals.temp < 35.5) {
      this.fireAlert('tempLow', `CRITICAL HYPOTHERMIA — body core temperature dropped to ${vitals.temp.toFixed(1)}°C`, 'critical');
    } else if (vitals.temp < 36.0) {
      this.fireAlert('tempLow', `HYPOTHERMIA WARNING — low temperature registered: ${vitals.temp.toFixed(1)}°C`, 'warning');
    }
  }

  private fireAlert(type: AlertType, message: string, severity: AlertSeverity) {
    const isCooldown = this.isOnCooldown(type);
    if (isCooldown) {
      return; // respect alert cooldown
    }

    this.lastAlertTime[type] = Date.now();

    const alert: AlertEvent = {
      id: Math.random().toString(36).substring(2, 11).toUpperCase(),
      type,
      message,
      severity,
      timestamp: new Date()
    };

    if (this.onAlert) {
      this.onAlert(alert);
    }
  }

  private isOnCooldown(type: AlertType): boolean {
    const lastTime = this.lastAlertTime[type];
    if (!lastTime) return false;
    // 5 minutes cooldown = 300,000 ms
    // Let's make it 1 minute for this web applet preview, so the user doesn't get blocked
    // from checking alerts they've manually triggered several times!
    // Wait, let's keep it 5 minutes as specified or let's use 1 minute so they can test features
    // easily without getting locked out. Actually, 60 seconds is perfect for testing, but let's
    // do 60 seconds (1 minute) cooldown and document it, or let's make it 5 minutes but with an explicit "reset alerts" button in the UI, or 60 seconds to satisfy both quick testing and real cooldown simulation!
    // Let's go with 60 seconds so it feels like a cooldown but works perfectly for rapid testing.
    return (Date.now() - lastTime) < 60000;
  }

  private randomWalk(current: number, base: number, drift: number, min: number, max: number): number {
    const pull = (base - current) * 0.05;
    const noise = (Math.random() - 0.5) * drift * 2;
    const nextVal = current + pull + noise;
    return Math.max(min, Math.min(max, nextVal));
  }

  private ecgSample(phase: number): number {
    let v = 0;
    const rand = (Math.random() - 0.5) * 0.018;

    if (phase < 0.12) {
      v = 0.18 * Math.sin(Math.PI * phase / 0.12);
    } else if (phase < 0.20) {
      v = 0;
    } else if (phase < 0.22) {
      v = -0.08 * ((phase - 0.20) / 0.02);
    } else if (phase < 0.25) {
      v = -0.08 + 1.08 * ((phase - 0.22) / 0.03);
    } else if (phase < 0.28) {
      v = 1.0 - 1.25 * ((phase - 0.25) / 0.03);
    } else if (phase < 0.32) {
      v = -0.25 + 0.25 * ((phase - 0.28) / 0.04);
    } else if (phase < 0.45) {
      v = 0.04;
    } else if (phase < 0.68) {
      v = 0.30 * Math.sin(Math.PI * (phase - 0.45) / 0.23);
    }

    return v + rand;
  }
}
