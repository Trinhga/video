export type TrafficLightColor = 'red' | 'yellow' | 'green';

export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'ambulance';

export type ScenarioType = 
  | 'early_warning_safe_stop'
  | 'intentional_violation'
  | 'stop_line_creep'
  | 'emergency_vehicle'
  | 'yellow_clearance'
  | 'custom_sandbox';

export interface Vehicle {
  id: string;
  type: VehicleType;
  name: string;
  plate: string;
  color: string;
  x: number; // distance from start of approach road in meters (0 to 120m, stop line is at 75m)
  speed: number; // m/s (e.g. 50 km/h = 13.89 m/s)
  initialSpeed: number; // m/s
  maxBrakingDecel: number; // m/s^2 (e.g. 4.5)
  isBraking: boolean;
  isAccelerating: boolean;
  isEmergency: boolean;
  length: number; // meters
  width: number; // meters
  status: 'approaching' | 'warned' | 'stopping' | 'stopped' | 'crossing' | 'violated' | 'cleared';
}

export interface TrafficLightState {
  color: TrafficLightColor;
  timeRemaining: number; // seconds
  cycleDurations: {
    green: number;
    yellow: number;
    red: number;
  };
}

export interface SimulationParams {
  roadLength: number; // 120m
  stopLinePos: number; // 75m
  dilemmaZoneStart: number; // 35m (40m before stop line)
  dilemmaZoneEnd: number; // 60m (15m before stop line)
  intersectionEnd: number; // 105m (30m past stop line)
  frictionCoeff: number; // 0.7 dry, 0.35 wet
  driverReactionTime: number; // seconds (0.8s - 1.2s)
  gracePeriod: number; // seconds after red before snapping (0.3s standard)
}

export interface ViolationEvidence {
  id: string;
  vehiclePlate: string;
  vehicleType: VehicleType;
  timestamp: string;
  location: string;
  speedAtViolation: number; // km/h
  redLightDurationAtViolation: number; // seconds after red
  violationType: 'RED_LIGHT_VIOLATION' | 'STOP_LINE_OVERSTEP' | 'EXEMPT_EMERGENCY' | 'NONE';
  legalRef: string;
  fineAmount: string;
  licensePenalty: string;
  frames: {
    frame1: {
      description: string;
      timeOffset: string;
      vehiclePos: string;
      lightState: string;
      capturedUrl?: string;
    };
    frame2: {
      description: string;
      timeOffset: string;
      vehiclePos: string;
      lightState: string;
      capturedUrl?: string;
    };
    frame3: {
      description: string;
      timeOffset: string;
      vehiclePos: string;
      lightState: string;
      capturedUrl?: string;
    };
  };
  hash: string;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'DISMISSED';
}

export interface WarningEvent {
  id: string;
  time: string;
  level: 'info' | 'warning' | 'danger' | 'critical';
  title: string;
  message: string;
  targetPlate: string;
  channel: 'V2X_HUD' | 'VMS_LED' | 'AUDIO_SIREN' | 'CAMERA_AI';
}
