/**
 * API service for communicating with the backend
 */
import axios from 'axios';
import type {
  Camera, Zone, Incident, HazardReport, CorrectiveAction,
  DashboardSummary, TrendData, AnalyticsSummary, Notification
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://localhost:8000' : 'https://workspacesafety.onrender.com');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health Check
export const healthCheck = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

// Dashboard APIs
export const getDashboardSummary = async (startDate?: string, endDate?: string): Promise<DashboardSummary> => {
  const params: any = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  
  const response = await api.get('/api/dashboard/summary', { params });
  return response.data;
};

export const getDashboardTrends = async (days: number = 7): Promise<TrendData> => {
  const response = await api.get('/api/dashboard/trends', { params: { days } });
  return response.data;
};

export const getRecentIncidents = async (limit: number = 10) => {
  const response = await api.get('/api/dashboard/recent-incidents', { params: { limit } });
  return response.data;
};

// Incident APIs
export const getIncidents = async (filters?: any) => {
  const response = await api.get('/api/incidents', { params: filters });
  return response.data;
};

export const getIncident = async (id: number): Promise<Incident> => {
  const response = await api.get(`/api/incidents/${id}`);
  return response.data;
};

export const createIncident = async (data: any): Promise<Incident> => {
  const response = await api.post('/api/incidents', data);
  return response.data;
};

export const updateIncident = async (id: number, data: any): Promise<Incident> => {
  const response = await api.patch(`/api/incidents/${id}`, data);
  return response.data;
};

export const acknowledgeIncident = async (id: number, notes?: string): Promise<Incident> => {
  const response = await api.post(`/api/incidents/${id}/acknowledge`, { notes });
  return response.data;
};

export const assignIncident = async (id: number, userId: number, notes?: string): Promise<Incident> => {
  const response = await api.post(`/api/incidents/${id}/assign`, { assigned_to_id: userId, notes });
  return response.data;
};

export const resolveIncident = async (id: number, resolutionNotes: string): Promise<Incident> => {
  const response = await api.post(`/api/incidents/${id}/resolve`, { resolution_notes: resolutionNotes });
  return response.data;
};

export const deleteIncident = async (id: number) => {
  const response = await api.delete(`/api/incidents/${id}`);
  return response.data;
};

// Camera APIs
export const getCameras = async () => {
  const response = await api.get('/api/cameras');
  return response.data;
};

export const getCamera = async (id: number): Promise<Camera> => {
  const response = await api.get(`/api/cameras/${id}`);
  return response.data;
};

export const createCamera = async (data: any): Promise<Camera> => {
  const response = await api.post('/api/cameras', data);
  return response.data;
};

export const updateCamera = async (id: number, data: any): Promise<Camera> => {
  const response = await api.patch(`/api/cameras/${id}`, data);
  return response.data;
};

export const deleteCamera = async (id: number) => {
  const response = await api.delete(`/api/cameras/${id}`);
  return response.data;
};

// Zone APIs
export const getZones = async () => {
  const response = await api.get('/api/zones');
  return response.data;
};

export const getZone = async (id: number): Promise<Zone> => {
  const response = await api.get(`/api/zones/${id}`);
  return response.data;
};

export const createZone = async (data: any): Promise<Zone> => {
  const response = await api.post('/api/zones', data);
  return response.data;
};

export const updateZone = async (id: number, data: any): Promise<Zone> => {
  const response = await api.patch(`/api/zones/${id}`, data);
  return response.data;
};

export const deleteZone = async (id: number) => {
  const response = await api.delete(`/api/zones/${id}`);
  return response.data;
};

// Hazard Report APIs
export const getHazardReports = async (filters?: any) => {
  const response = await api.get('/api/hazards', { params: filters });
  return response.data;
};

export const getHazardReport = async (id: number): Promise<HazardReport> => {
  const response = await api.get(`/api/hazards/${id}`);
  return response.data;
};

export const createHazardReport = async (data: any): Promise<HazardReport> => {
  const response = await api.post('/api/hazards', data);
  return response.data;
};

export const updateHazardReport = async (id: number, data: any): Promise<HazardReport> => {
  const response = await api.patch(`/api/hazards/${id}`, data);
  return response.data;
};

export const deleteHazardReport = async (id: number) => {
  const response = await api.delete(`/api/hazards/${id}`);
  return response.data;
};

// Corrective Action APIs
export const getCorrectiveActions = async (filters?: any) => {
  const response = await api.get('/api/actions', { params: filters });
  return response.data;
};

export const getCorrectiveAction = async (id: number): Promise<CorrectiveAction> => {
  const response = await api.get(`/api/actions/${id}`);
  return response.data;
};

export const createCorrectiveAction = async (data: any): Promise<CorrectiveAction> => {
  const response = await api.post('/api/actions', data);
  return response.data;
};

export const updateCorrectiveAction = async (id: number, data: any): Promise<CorrectiveAction> => {
  const response = await api.patch(`/api/actions/${id}`, data);
  return response.data;
};

export const deleteCorrectiveAction = async (id: number) => {
  const response = await api.delete(`/api/actions/${id}`);
  return response.data;
};

// Analytics APIs
export const getAnalyticsSummary = async (startDate?: string, endDate?: string, zoneId?: number): Promise<AnalyticsSummary> => {
  const params: any = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  if (zoneId) params.zone_id = zoneId;
  
  const response = await api.get('/api/analytics/summary', { params });
  return response.data;
};

export const getAnalyticsTrends = async (days: number = 30, metric: string = 'incidents') => {
  const response = await api.get('/api/analytics/trends', { params: { days, metric } });
  return response.data;
};

export const getZoneRiskAnalysis = async (days: number = 30) => {
  const response = await api.get('/api/analytics/zone-risk', { params: { days } });
  return response.data;
};

// Notification APIs
export const getNotifications = async (filters?: any) => {
  const response = await api.get('/api/notifications', { params: filters });
  return response.data;
};

export const getNotification = async (id: number): Promise<Notification> => {
  const response = await api.get(`/api/notifications/${id}`);
  return response.data;
};

export default api;
