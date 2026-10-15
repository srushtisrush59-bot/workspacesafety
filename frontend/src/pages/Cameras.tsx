import { useEffect, useState } from 'react';
import { Camera as CameraIcon, Plus } from 'lucide-react';
import { getCameras } from '../services/api';
import { formatTimeAgo } from '../utils/formatters';
import type { Camera } from '../types';

export default function Cameras() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      setLoading(true);
      const data = await getCameras();
      setCameras(data.cameras || []);
    } catch (error) {
      console.error('Error loading cameras:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Camera Management</h1>
          <p className="text-gray-400 mt-1">Configure and monitor surveillance cameras</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Camera</span>
        </button>
      </div>

      {/* Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full card p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading cameras...</p>
          </div>
        ) : cameras.length === 0 ? (
          <div className="col-span-full card p-12 text-center">
            <CameraIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No cameras configured</p>
          </div>
        ) : (
          cameras.map((camera) => (
            <div key={camera.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <CameraIcon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className={camera.is_connected ? 'status-online' : 'status-offline'} />
                  <span className={`text-xs ${camera.is_connected ? 'text-green-400' : 'text-red-400'}`}>
                    {camera.is_connected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-1">{camera.name}</h3>
              {camera.location && (
                <p className="text-sm text-gray-400 mb-3">{camera.location}</p>
              )}
              
              <div className="space-y-2 text-sm">
                {camera.zone_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Zone:</span>
                    <span className="text-white">{camera.zone_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white uppercase">{camera.source_type}</span>
                </div>
                {camera.last_connected_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Seen:</span>
                    <span className="text-white">{formatTimeAgo(camera.last_connected_at)}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-700 flex space-x-2">
                <button className="btn-secondary flex-1 text-sm py-2">Edit</button>
                <button className="btn-secondary text-sm py-2 px-3">View</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
