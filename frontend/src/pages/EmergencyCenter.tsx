import { useEffect, useState } from 'react';
import { AlertCircle, Phone, FileText } from 'lucide-react';
import { getIncidents } from '../services/api';
import { formatTimeAgo, getSeverityColor } from '../utils/formatters';

export default function EmergencyCenter() {
  const [criticalIncidents, setCriticalIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCriticalIncidents();
    // Refresh every 30 seconds
    const interval = setInterval(loadCriticalIncidents, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadCriticalIncidents = async () => {
    try {
      const data = await getIncidents({ severity: 'critical', status: 'new,acknowledged,assigned' });
      setCriticalIncidents(data.incidents || []);
    } catch (error) {
      console.error('Error loading critical incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const emergencyContacts = [
    { name: 'Safety Officer', phone: '+1 (555) 0100', role: 'Primary Contact' },
    { name: 'Facility Manager', phone: '+1 (555) 0101', role: 'Secondary Contact' },
    { name: 'Emergency Services', phone: '911', role: 'Emergency' },
  ];

  const procedures = [
    {
      type: 'Restricted Zone Violation',
      steps: [
        'Verify the violation through camera feed',
        'Immediately notify the person via PA system',
        'Dispatch safety officer to the location',
        'Document the incident',
      ]
    },
    {
      type: 'Chemical Spill',
      steps: [
        'Activate emergency alarm',
        'Evacuate the affected area',
        'Contact hazmat team',
        'Secure the perimeter',
        'Notify relevant authorities',
      ]
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Emergency Response Center</h1>
        <p className="text-gray-400 mt-1">Critical incident monitoring and emergency procedures</p>
      </div>

      {/* Alert Banner */}
      {criticalIncidents.length > 0 && (
        <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-6 animate-pulse-slow">
          <div className="flex items-start space-x-4">
            <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-bold text-red-400">
                {criticalIncidents.length} CRITICAL INCIDENT{criticalIncidents.length !== 1 ? 'S' : ''} ACTIVE
              </h2>
              <p className="text-red-300 mt-1">Immediate attention required</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Critical Incidents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Active Critical Incidents</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading incidents...</p>
              </div>
            ) : criticalIncidents.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No critical incidents</p>
                <p className="text-gray-500 text-sm mt-2">All systems operating normally</p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="bg-red-500/10 border border-red-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`badge ${getSeverityColor(incident.severity)}`}>
                            {incident.severity.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-400">
                            {formatTimeAgo(incident.created_at)}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold text-lg">{incident.title}</h3>
                        <p className="text-gray-300 text-sm mt-1">{incident.description}</p>
                      </div>
                      <div className="text-3xl text-red-400">#{incident.id}</div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      {incident.zone_name && <span>📍 {incident.zone_name}</span>}
                      {incident.camera_name && <span>📹 {incident.camera_name}</span>}
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button className="btn-danger flex-1">Acknowledge & Respond</button>
                      <button className="btn-secondary">View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Procedures */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Emergency Procedures</h2>
            
            <div className="space-y-4">
              {procedures.map((procedure, idx) => (
                <div key={idx} className="border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">{procedure.type}</h3>
                  </div>
                  <ol className="space-y-2">
                    {procedure.steps.map((step, stepIdx) => (
                      <li key={stepIdx} className="text-sm text-gray-400 flex">
                        <span className="text-blue-400 font-semibold mr-2">{stepIdx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="card p-6 h-fit">
          <h2 className="text-lg font-semibold text-white mb-4">Emergency Contacts</h2>
          
          <div className="space-y-3">
            {emergencyContacts.map((contact, idx) => (
              <div key={idx} className="border border-slate-700 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{contact.name}</h3>
                    <p className="text-sm text-gray-400">{contact.role}</p>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-blue-400 font-mono text-lg mt-1 block hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
