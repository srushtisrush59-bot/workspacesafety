import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import { getIncidents } from '../services/api';
import { formatTimeAgo, getSeverityColor, getStatusColor, formatIncidentType } from '../utils/formatters';
import type { Incident } from '../types';

export default function Incidents() {
  const [searchParams] = useSearchParams();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    search: searchParams.get('search') || ''
  });

  useEffect(() => {
    loadIncidents();
  }, [filters.severity, filters.status]);

  useEffect(() => {
    setFilters((current) => ({
      ...current,
      severity: searchParams.get('severity') || '',
      search: searchParams.get('search') || '',
    }));
  }, [searchParams]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.severity) params.severity = filters.severity;
      if (filters.status) params.status = filters.status;
      
      const data = await getIncidents(params);
      setIncidents(data.incidents || []);
    } catch (error) {
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        incident.title?.toLowerCase().includes(searchLower) ||
        incident.description?.toLowerCase().includes(searchLower) ||
        incident.zone_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Incident Management</h1>
          <p className="text-gray-400 mt-1">Track and manage safety incidents</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Report Incident</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search incidents..."
                className="input w-full pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
          
          <select
            className="select"
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            className="select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="assigned">Assigned</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading incidents...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="card p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No incidents found</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              className="card card-hover p-5 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`badge ${getSeverityColor(incident.severity)}`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className={`badge ${getStatusColor(incident.status)}`}>
                      {incident.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400">
                      {formatIncidentType(incident.incident_type)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {incident.title || 'Untitled Incident'}
                  </h3>
                  
                  {incident.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {incident.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    {incident.zone_name && (
                      <span>📍 {incident.zone_name}</span>
                    )}
                    {incident.camera_name && (
                      <span>📹 {incident.camera_name}</span>
                    )}
                    {incident.assigned_to_name && (
                      <span>👤 {incident.assigned_to_name}</span>
                    )}
                    <span>🕒 {formatTimeAgo(incident.created_at)}</span>
                    {incident.risk_score > 0 && (
                      <span className="text-red-400">
                        ⚠️ Risk: {incident.risk_score.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <span className="text-2xl">#{incident.id}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
