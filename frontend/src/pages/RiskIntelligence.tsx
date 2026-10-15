import { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { getZoneRiskAnalysis } from '../services/api';

export default function RiskIntelligence() {
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRiskData();
  }, []);

  const loadRiskData = async () => {
    try {
      setLoading(true);
      const data = await getZoneRiskAnalysis(30);
      setRiskData(data);
    } catch (error) {
      console.error('Error loading risk data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 10) return 'text-red-500';
    if (score >= 5) return 'text-orange-500';
    if (score >= 2) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Risk Intelligence</h1>
        <p className="text-gray-400 mt-1">AI-powered risk assessment and prevention</p>
      </div>

      {/* Risk Overview */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Analyzing risk data...</p>
        </div>
      ) : riskData && riskData.zones ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {riskData.zones.slice(0, 3).map((zone: any) => (
              <div key={zone.zone_id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{zone.zone_name}</h3>
                    <p className="text-sm text-gray-400 capitalize">{zone.zone_type.replace('_', ' ')}</p>
                  </div>
                  <AlertTriangle className={`w-8 h-8 ${getRiskColor(zone.risk_score)}`} />
                </div>
                
                <div className="text-3xl font-bold mb-2 ${getRiskColor(zone.risk_score)}">
                  {zone.risk_score.toFixed(1)}
                </div>
                <p className="text-sm text-gray-400 mb-4">Risk Score</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Incidents:</span>
                    <span className="text-white">{zone.incident_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Critical:</span>
                    <span className="text-red-400">{zone.critical_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Open Hazards:</span>
                    <span className="text-yellow-400">{zone.open_hazards}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* All Zones Table */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Zone Risk Analysis</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Zone</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Risk Score</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Incidents</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Critical</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Hazards</th>
                  </tr>
                </thead>
                <tbody>
                  {riskData.zones.map((zone: any) => (
                    <tr key={zone.zone_id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-3 px-4 text-white font-medium">{zone.zone_name}</td>
                      <td className="py-3 px-4 text-gray-400 capitalize text-sm">
                        {zone.zone_type.replace('_', ' ')}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold ${getRiskColor(zone.risk_score)}`}>
                        {zone.risk_score.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right text-white">{zone.incident_count}</td>
                      <td className="py-3 px-4 text-right text-red-400">{zone.critical_count}</td>
                      <td className="py-3 px-4 text-right text-yellow-400">{zone.open_hazards}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No risk data available</p>
        </div>
      )}
    </div>
  );
}
