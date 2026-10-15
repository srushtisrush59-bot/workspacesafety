import { useEffect, useState } from 'react';
import { Map, Plus } from 'lucide-react';
import { getZones } from '../services/api';
import type { Zone } from '../types';

const riskColors: Record<string, { fill: string; stroke: string; label: string }> = {
  critical: { fill: '#ef4444', stroke: '#fca5a5', label: 'Critical risk' },
  high: { fill: '#f97316', stroke: '#fdba74', label: 'High risk' },
  medium: { fill: '#eab308', stroke: '#fde047', label: 'Medium risk' },
  low: { fill: '#22c55e', stroke: '#86efac', label: 'Low risk' },
};

export default function ZoneMap() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      const data = await getZones();
      const loadedZones: Zone[] = data.zones || [];
      setZones(loadedZones);
      setSelectedZone(loadedZones[0] || null);
    } catch (error) {
      console.error('Error loading zones:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Factory Zone Map</h1>
          <p className="text-gray-400 mt-1">View and manage safety zones</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Create Zone</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone List */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Zones</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedZone?.id === zone.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <div className="font-medium mb-1">{zone.name}</div>
                  <div className="text-xs opacity-80">
                    {zone.zone_type.replace('_', ' ')} • Risk: {zone.risk_level}
                  </div>
                  {zone.incident_count ? (
                    <div className="text-xs text-red-400 mt-1">
                      {zone.incident_count} incidents
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map View */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Floor Plan</h2>
          
          {/* Floor Plan Placeholder */}
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a1220]">
            {zones.some((zone) => (zone.polygon_coordinates?.length || 0) >= 3) ? (
              <svg
                viewBox="0 0 800 540"
                role="img"
                aria-label="Interactive factory floor plan showing safety zones and their risk levels"
                className="block h-auto w-full"
              >
                <defs>
                  <pattern id="floor-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#233047" strokeWidth="1" />
                  </pattern>
                  <pattern id="floor-grid-major" width="160" height="160" patternUnits="userSpaceOnUse">
                    <rect width="160" height="160" fill="url(#floor-grid)" />
                    <path d="M 160 0 L 0 0 0 160" fill="none" stroke="#34445d" strokeWidth="1.5" />
                  </pattern>
                </defs>
                <rect width="800" height="540" fill="#0b1423" />
                <rect width="800" height="540" fill="url(#floor-grid-major)" opacity="0.6" />
                <text x="28" y="36" fill="#64748b" fontSize="12" letterSpacing="2">
                  FACILITY FLOOR PLAN · SELECT A ZONE
                </text>
                {zones.map((zone) => {
                  const points = zone.polygon_coordinates;
                  if (!points || points.length < 3) return null;

                  const color = riskColors[zone.risk_level.toLowerCase()] || riskColors.low;
                  const isSelected = selectedZone?.id === zone.id;
                  const center = points.reduce(
                    (total, point) => ({ x: total.x + point.x / points.length, y: total.y + point.y / points.length }),
                    { x: 0, y: 0 }
                  );

                  return (
                    <g
                      key={zone.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`${zone.name}, ${color.label}`}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedZone(zone)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedZone(zone);
                        }
                      }}
                      className="cursor-pointer outline-none"
                    >
                      <polygon
                        points={points.map((point) => `${point.x},${point.y}`).join(' ')}
                        fill={color.fill}
                        fillOpacity={isSelected ? 0.3 : 0.15}
                        stroke={color.stroke}
                        strokeWidth={isSelected ? 3 : 1.5}
                        strokeDasharray={zone.restricted_access ? '7 4' : undefined}
                        className="transition-all hover:fill-opacity-30"
                      />
                      <circle cx={center.x} cy={center.y} r="5" fill={color.stroke} />
                      <text
                        x={center.x}
                        y={center.y + 22}
                        fill="#e2e8f0"
                        fontSize="12"
                        fontWeight="600"
                        textAnchor="middle"
                        className="pointer-events-none"
                      >
                        {zone.name}
                      </text>
                      {zone.restricted_access && (
                        <text
                          x={center.x}
                          y={center.y - 13}
                          fill={color.stroke}
                          fontSize="9"
                          fontWeight="700"
                          letterSpacing="1"
                          textAnchor="middle"
                          className="pointer-events-none"
                        >
                          RESTRICTED
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            ) : (
              <div className="flex aspect-[16/10] flex-col items-center justify-center bg-[linear-gradient(rgba(51,65,85,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,.22)_1px,transparent_1px)] bg-[size:32px_32px] px-6 text-center">
                <Map className="h-12 w-12 text-slate-600" />
                <p className="mt-4 font-medium text-slate-300">
                  {zones.length ? 'No zone boundaries added yet' : 'No zones to display yet'}
                </p>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Add zone boundary coordinates to see your facility layout here.
                </p>
              </div>
            )}
          </div>
          {zones.some((zone) => (zone.polygon_coordinates?.length || 0) >= 3) && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400">
              {Object.entries(riskColors).map(([risk, color]) => (
                <span key={risk} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color.fill }} />
                  <span className="capitalize">{risk} risk</span>
                </span>
              ))}
              <span className="ml-auto text-slate-500">Dashed outline: restricted access</span>
            </div>
          )}

          {/* Zone Details */}
          {selectedZone && (
            <div className="mt-6 space-y-4">
              <div className="border-t border-slate-700 pt-4">
                <h3 className="text-lg font-semibold text-white mb-3">{selectedZone.name}</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Type</p>
                    <p className="text-white">{selectedZone.zone_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Risk Level</p>
                    <p className="text-white capitalize">{selectedZone.risk_level}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Incidents</p>
                    <p className="text-white">{selectedZone.incident_count || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Open Hazards</p>
                    <p className="text-white">{selectedZone.open_hazard_count || 0}</p>
                  </div>
                </div>

                {selectedZone.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400">Description</p>
                    <p className="text-white">{selectedZone.description}</p>
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Safety Requirements</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedZone.require_helmet && (
                      <span className="badge badge-info">Helmet Required</span>
                    )}
                    {selectedZone.require_vest && (
                      <span className="badge badge-info">Safety Vest Required</span>
                    )}
                    {selectedZone.restricted_access && (
                      <span className="badge badge-critical">Restricted Access</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
