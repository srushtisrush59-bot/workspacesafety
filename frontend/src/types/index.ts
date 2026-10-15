// Type definitions for Workplace Safety Sentinel

export type UserRole = 'admin' | 'safety_officer' | 'maintenance_staff' | 'viewer';

export type IncidentType = 
  | 'restricted_zone_violation'
  | 'ppe_violation'
  | 'unsafe_behavior'
  | 'equipment_hazard'
  | 'environmental_hazard'
  | 'near_miss'
  | 'other';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus = 
  | 'new'
  | 'acknowledged'
  | 'assigned'
  | 'investigating'
  | 'resolved'
  | 'closed';

export type ZoneType = 
  | 'restricted'
  | 'machine_hazard'
  | 'pedestrian'
  | 'general'
  | 'loading_dock'
  | 'chemical_storage';

export type ActionStatus = 
  | 'open'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'verified';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Camera {
  id: number;
  name: string;
  location?: string;
  source_type: string;
  zone_id?: number;
  zone_name?: string;
  is_enabled: boolean;
  is_connected: boolean;
  last_connected_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Zone {
  id: number;
  name: string;
  zone_type: ZoneType;
  description?: string;
  polygon_coordinates?: Array<{x: number; y: number}>;
  risk_level: string;
  require_helmet: boolean;
  require_vest: boolean;
  restricted_access: boolean;
  incident_count?: number;
  open_hazard_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: number;
  incident_type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title?: string;
  description?: string;
  camera_id?: number;
  camera_name?: string;
  zone_id?: number;
  zone_name?: string;
  detection_confidence?: number;
  risk_score: number;
  risk_factors?: string[];
  assigned_to_id?: number;
  assigned_to_name?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HazardReport {
  id: number;
  hazard_type: string;
  description: string;
  location?: string;
  zone_id?: number;
  zone_name?: string;
  priority: string;
  reporter_id?: number;
  reporter_contact?: string;
  status: string;
  assigned_to_id?: number;
  assigned_to_name?: string;
  resolved_at?: string;
  resolution_notes?: string;
  photo_path?: string;
  created_at: string;
  updated_at: string;
}

export interface CorrectiveAction {
  id: number;
  incident_id?: number;
  hazard_report_id?: number;
  title: string;
  description: string;
  priority: string;
  assigned_to_id?: number;
  assigned_to_name?: string;
  due_date?: string;
  status: ActionStatus;
  completed_at?: string;
  verified_at?: string;
  completion_notes?: string;
  evidence_path?: string;
  is_overdue?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  notification_type: string;
  incident_id?: number;
  user_id?: number;
  title: string;
  message: string;
  channel: string;
  status: string;
  sent_at?: string;
  acknowledged_at?: string;
  created_at: string;
}

export interface DashboardSummary {
  cameras: {
    total: number;
    connected: number;
    disconnected: number;
  };
  incidents: {
    total: number;
    open: number;
    critical: number;
    resolved: number;
  };
  violations: {
    restricted_zone: number;
    ppe: number;
  };
  hazards: {
    open: number;
  };
  actions: {
    overdue: number;
  };
  detection: {
    people_detected: number;
  };
  compliance: {
    rate: number;
    status: string;
  };
  date_range: {
    start: string;
    end: string;
  };
}

export interface TrendData {
  time_series: Array<{date: string; count: number}>;
  by_severity: Record<string, number>;
  by_type: Record<string, number>;
  by_zone: Array<{zone: string; count: number}>;
}

export interface AnalyticsSummary {
  date_range: {
    start: string;
    end: string;
  };
  incidents: {
    total: number;
    by_severity: Record<string, number>;
    by_status: Record<string, number>;
    by_type: Record<string, number>;
    by_zone: Array<{zone: string; count: number}>;
  };
  performance: {
    avg_resolution_hours?: number;
    avg_acknowledgment_minutes?: number;
    action_completion_rate: number;
  };
}
