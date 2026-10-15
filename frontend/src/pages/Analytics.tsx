import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnalyticsSummary } from '../services/api';
import type { AnalyticsSummary } from '../types';

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalyticsSummary();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-center text-gray-400">No analytics data available</div>;
  }

  const severityData = Object.entries(analytics.incidents.by_severity).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    count: value
  }));

  const typeData = Object.entries(analytics.incidents.by_type).map(([key, value]) => ({
    name: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    count: value
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics & Reporting</h1>
        <p className="text-gray-400 mt-1">Comprehensive safety performance analytics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <p className="text-sm text-gray-400 mb-1">Total Incidents</p>
          <p className="text-3xl font-bold text-white">{analytics.incidents.total}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-400 mb-1">Avg Resolution Time</p>
          <p className="text-3xl font-bold text-white">
            {analytics.performance.avg_resolution_hours?.toFixed(1) || 'N/A'}
            {analytics.performance.avg_resolution_hours && <span className="text-lg text-gray-400"> hrs</span>}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-400 mb-1">Avg Acknowledgment</p>
          <p className="text-3xl font-bold text-white">
            {analytics.performance.avg_acknowledgment_minutes?.toFixed(0) || 'N/A'}
            {analytics.performance.avg_acknowledgment_minutes && <span className="text-lg text-gray-400"> min</span>}
          </p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-gray-400 mb-1">Action Completion</p>
          <p className="text-3xl font-bold text-white">
            {analytics.performance.action_completion_rate.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Incidents by Severity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Incidents by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={120} />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Incidents by Zone */}
      {analytics.incidents.by_zone.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Incidents by Zone</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.incidents.by_zone}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="zone" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#e5e7eb' }}
              />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
