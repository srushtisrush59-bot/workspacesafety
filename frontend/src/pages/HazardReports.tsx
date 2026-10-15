import { useEffect, useState } from 'react';
import { Plus, FileText } from 'lucide-react';
import { getHazardReports, createHazardReport } from '../services/api';
import { formatTimeAgo, getPriorityColor, getStatusColor } from '../utils/formatters';
import type { HazardReport } from '../types';

export default function HazardReports() {
  const [hazards, setHazards] = useState<HazardReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    hazard_type: '',
    description: '',
    location: '',
    priority: 'medium',
    reporter_contact: ''
  });

  useEffect(() => {
    loadHazards();
  }, []);

  const loadHazards = async () => {
    try {
      setLoading(true);
      const data = await getHazardReports();
      setHazards(data.hazards || []);
    } catch (error) {
      console.error('Error loading hazards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHazardReport(formData);
      setShowForm(false);
      setFormData({
        hazard_type: '',
        description: '',
        location: '',
        priority: 'medium',
        reporter_contact: ''
      });
      loadHazards();
    } catch (error) {
      console.error('Error creating hazard report:', error);
    }
  };

  const hazardTypes = [
    'Slippery Floor',
    'Exposed Wiring',
    'Damaged Equipment',
    'Chemical Spill',
    'Blocked Exit',
    'Unsafe Equipment',
    'Poor Lighting',
    'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Worker Hazard Reports</h1>
          <p className="text-gray-400 mt-1">Report and track workplace safety hazards</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Report Hazard</span>
        </button>
      </div>

      {/* Report Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Report a Hazard</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hazard Type *
                </label>
                <select
                  className="select w-full"
                  value={formData.hazard_type}
                  onChange={(e) => setFormData({ ...formData, hazard_type: e.target.value })}
                  required
                >
                  <option value="">Select a type...</option>
                  {hazardTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  className="textarea w-full"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the hazard in detail..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Assembly Line A, Station 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  className="select w-full"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contact (Optional)
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.reporter_contact}
                  onChange={(e) => setFormData({ ...formData, reporter_contact: e.target.value })}
                  placeholder="Your email or phone number"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Submit Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hazard Reports List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading hazard reports...</p>
          </div>
        ) : hazards.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No hazard reports</p>
            <p className="text-gray-500 text-sm mt-2">Click "Report Hazard" to submit a new report</p>
          </div>
        ) : (
          hazards.map((hazard) => (
            <div key={hazard.id} className="card card-hover p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`badge ${getPriorityColor(hazard.priority)}`}>
                      {hazard.priority.toUpperCase()}
                    </span>
                    <span className={`badge ${getStatusColor(hazard.status)}`}>
                      {hazard.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400">{hazard.hazard_type}</span>
                  </div>
                  
                  <p className="text-white mb-3">{hazard.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    {hazard.location && <span>📍 {hazard.location}</span>}
                    {hazard.zone_name && <span>🏭 {hazard.zone_name}</span>}
                    {hazard.assigned_to_name && <span>👤 {hazard.assigned_to_name}</span>}
                    <span>🕒 {formatTimeAgo(hazard.created_at)}</span>
                  </div>
                </div>
                
                <div className="ml-4">
                  <span className="text-2xl text-gray-500">#{hazard.id}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
