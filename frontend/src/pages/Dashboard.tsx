import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  AlertTriangle,
  ShieldAlert,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import { getDashboardSummary, getDashboardTrends, getRecentIncidents } from '../services/api';
import { formatTimeAgo, getSeverityColor, formatIncidentType } from '../utils/formatters';
import { readPreferences } from '../utils/appPreferences';
import type { DashboardSummary, TrendData, Incident } from '../types';

type RecentIncident = Pick<
  Incident,
  'id' | 'severity' | 'title' | 'camera_name' | 'zone_name' | 'created_at'
> & { type: Incident['incident_type'] };

const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
};

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [recentIncidents, setRecentIncidents] = useState<RecentIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshSeconds, setRefreshSeconds] = useState(
    () => readPreferences().dashboardRefreshSeconds
  );

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryData, trendsData, incidentsData] = await Promise.all([
        getDashboardSummary(),
        getDashboardTrends(7),
        getRecentIncidents(10)
      ]);
      
      setSummary(summaryData);
      setTrends(trendsData);
      setRecentIncidents(incidentsData.incidents || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const updateRefreshInterval = () => {
      setRefreshSeconds(readPreferences().dashboardRefreshSeconds);
    };
    window.addEventListener('sentinel-preferences-updated', updateRefreshInterval);
    return () => window.removeEventListener('sentinel-preferences-updated', updateRefreshInterval);
  }, []);

  useEffect(() => {
    if (refreshSeconds === 0) return;
    const timer = window.setInterval(() => void loadDashboardData(), refreshSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [loadDashboardData, refreshSeconds]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!summary || !trends) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10">
            <AlertCircle className="h-7 w-7 text-red-300" />
          </div>
          <p className="font-semibold text-slate-100">Dashboard data is unavailable</p>
          <p className="mt-1 text-sm text-slate-500">Check your connection to the safety service and try again.</p>
          <button type="button" onClick={loadDashboardData} className="btn-secondary mt-5">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const severityData = Object.entries(trends.by_severity).map(([severity, value]) => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value,
    color: COLORS[severity as keyof typeof COLORS] || COLORS.low,
  }));

  const typeData = Object.entries(trends.by_type).map(([key, value]) => ({
    name: formatIncidentType(key),
    count: value
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Workspace</span>
            <span className="text-slate-700">/</span>
            <span className="text-cyan-300">Overview</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[30px]">Safety overview</h1>
          <p className="mt-1.5 text-sm text-slate-400">A real-time view of safety across your workplace.</p>
        </div>
        <Link to="/analytics" className="btn-primary self-start sm:self-auto">
          <TrendingUp className="w-5 h-5" />
          <span>View analytics</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Cameras"
          value={summary.cameras.total}
          icon={Camera}
          subtitle={`${summary.cameras.connected} connected`}
          color="blue"
        />
        <StatCard
          title="Open Incidents"
          value={summary.incidents.open}
          icon={AlertTriangle}
          subtitle={`${summary.incidents.critical} critical`}
          color={summary.incidents.critical > 0 ? 'red' : 'yellow'}
        />
        <StatCard
          title="People Detected"
          value={summary.detection.people_detected}
          icon={Users}
          subtitle="Last 30 days"
          color="purple"
        />
        <StatCard
          title="Safety Compliance"
          value={`${summary.compliance.rate.toFixed(1)}%`}
          icon={ShieldAlert}
          subtitle={summary.compliance.status}
          color={summary.compliance.rate >= 90 ? 'green' : 'red'}
        />
      </div>

      {summary.incidents.critical > 0 && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-200">Critical incidents require attention</h3>
              <p className="mt-1 text-sm text-red-100/70">
                {summary.incidents.critical} critical incident{summary.incidents.critical !== 1 ? 's' : ''} need immediate review and response.
              </p>
              <Link to="/incidents?severity=critical" className="mt-2 inline-block text-sm font-semibold text-red-200 hover:underline">
                View critical incidents →
              </Link>
            </div>
          </div>
        </div>
      )}

      {summary.actions.overdue > 0 && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-200">Overdue corrective actions</h3>
              <p className="mt-1 text-sm text-amber-100/70">
                {summary.actions.overdue} corrective action{summary.actions.overdue !== 1 ? 's' : ''} past due date.
              </p>
              <Link to="/actions?show_overdue_only=true" className="mt-2 inline-block text-sm font-semibold text-amber-200 hover:underline">
                Review overdue actions →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_1fr]">
        <div className="card min-w-0 p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-white">Incident trend</h2>
              <p className="mt-1 text-xs text-slate-500">Reported incidents over the last 7 days</p>
            </div>
            <span className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-slate-400">
              7 days
            </span>
          </div>
          {trends.time_series.some((day) => day.count > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trends.time_series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243044" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101827', border: '1px solid #263246', borderRadius: 12 }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Line type="monotone" dataKey="count" name="Incidents" stroke="#67e8f9" strokeWidth={2.5} dot={{ fill: '#67e8f9', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#67e8f9', stroke: '#0f172a', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015] text-center">
              <TrendingUp className="h-8 w-8 text-slate-600" />
              <p className="mt-3 text-sm font-medium text-slate-300">No incidents in the past 7 days</p>
              <p className="mt-1 text-xs text-slate-500">Newly reported incidents will appear here.</p>
            </div>
          )}
        </div>

        <div className="card min-w-0 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="font-semibold text-white">Incidents by severity</h2>
            <p className="mt-1 text-xs text-slate-500">Breakdown by reported severity</p>
          </div>
          {severityData.some((severity) => severity.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={82}
                  innerRadius={52}
                  paddingAngle={3}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#101827', border: '1px solid #263246', borderRadius: 12 }}
                />
                <Legend verticalAlign="bottom" height={30} iconType="circle" iconSize={7} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.015] text-center">
              <ShieldAlert className="h-8 w-8 text-slate-600" />
              <p className="mt-3 text-sm font-medium text-slate-300">No severity data yet</p>
              <p className="mt-1 text-xs text-slate-500">Severity breakdown appears after incidents are reported.</p>
            </div>
          )}
        </div>
      </div>

      {/* Incidents by Type */}
      {typeData.length > 0 && (
        <div className="card p-5 sm:p-6">
          <h2 className="font-semibold text-white">Incidents by type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243044" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" angle={-35} textAnchor="end" height={80} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#101827', border: '1px solid #263246', borderRadius: 12 }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="count" fill="#67e8f9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Incidents */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-white">Recent incidents</h2>
            <p className="mt-1 text-xs text-slate-500">Latest safety events across your workplace</p>
          </div>
          <Link to="/incidents" className="text-sm font-semibold text-cyan-300 hover:text-cyan-200">
            View all →
          </Link>
        </div>
        
        <div className="space-y-3">
          {recentIncidents.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>No recent incidents</p>
            </div>
          ) : (
            recentIncidents.map((incident) => (
              <Link
                key={incident.id}
                to="/incidents"
                className="block rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`badge ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatIncidentType(incident.type)}
                      </span>
                    </div>
                    <p className="mb-1 font-medium text-white">{incident.title || 'Untitled incident'}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      {incident.zone_name && (
                        <span>📍 {incident.zone_name}</span>
                      )}
                      {incident.camera_name && (
                        <span>📹 {incident.camera_name}</span>
                      )}
                      <span>{formatTimeAgo(incident.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
