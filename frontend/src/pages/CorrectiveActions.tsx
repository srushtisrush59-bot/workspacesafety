import { useEffect, useState } from 'react';
import { CheckSquare, Clock } from 'lucide-react';
import { getCorrectiveActions } from '../services/api';
import { formatDate, getStatusColor, getPriorityColor } from '../utils/formatters';
import type { CorrectiveAction } from '../types';

export default function CorrectiveActions() {
  const [actions, setActions] = useState<CorrectiveAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadActions();
  }, [filter]);

  const loadActions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter === 'overdue') {
        params.show_overdue_only = true;
      } else if (filter !== 'all') {
        params.status = filter;
      }
      
      const data = await getCorrectiveActions(params);
      setActions(data.actions || []);
    } catch (error) {
      console.error('Error loading actions:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Corrective Actions</h1>
        <p className="text-gray-400 mt-1">Track and manage corrective actions</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-700">
        {[
          { key: 'all', label: 'All Actions' },
          { key: 'open', label: 'Open' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'overdue', label: 'Overdue' },
          { key: 'completed', label: 'Completed' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === tab.key
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading actions...</p>
          </div>
        ) : actions.length === 0 ? (
          <div className="card p-12 text-center">
            <CheckSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No actions found</p>
          </div>
        ) : (
          actions.map((action) => (
            <div
              key={action.id}
              className={`card p-5 ${action.is_overdue ? 'border-l-4 border-red-500' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`badge ${getStatusColor(action.status)}`}>
                      {action.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`badge ${getPriorityColor(action.priority)}`}>
                      {action.priority.toUpperCase()}
                    </span>
                    {action.is_overdue && (
                      <span className="badge badge-critical">OVERDUE</span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{action.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                    {action.assigned_to_name && (
                      <span>👤 {action.assigned_to_name}</span>
                    )}
                    {action.due_date && (
                      <span className={action.is_overdue ? 'text-red-400' : ''}>
                        <Clock className="w-4 h-4 inline mr-1" />
                        Due: {formatDate(action.due_date)}
                      </span>
                    )}
                    {action.incident_id && (
                      <span>🔗 Incident #{action.incident_id}</span>
                    )}
                    {action.hazard_report_id && (
                      <span>🔗 Hazard #{action.hazard_report_id}</span>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 text-right">
                  <span className="text-2xl text-gray-500">#{action.id}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
