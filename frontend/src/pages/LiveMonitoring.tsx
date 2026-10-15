import { useEffect, useState } from 'react';
import { Video, Camera as CameraIcon, AlertCircle, Play } from 'lucide-react';
import { getCameras } from '../services/api';
import type { Camera } from '../types';

export default function LiveMonitoring() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      setLoading(true);
      const data = await getCameras();
      setCameras(data.cameras || []);
      if (data.cameras && data.cameras.length > 0) {
        setSelectedCamera(data.cameras[0]);
      }
    } catch (error) {
      console.error('Error loading cameras:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Live Monitoring</h1>
        <p className="text-gray-400 mt-1">Real-time camera feeds and detection monitoring</p>
      </div>

      {/* Demo Mode Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-yellow-400 font-semibold">Demo Mode</h3>
            <p className="text-yellow-300/80 text-sm mt-1">
              Live camera monitoring requires connection to a vision service (PipeGen + DeepStream).
              Configure cameras and connect a real AI vision pipeline to enable live detection monitoring.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera List */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Available Cameras</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Loading cameras...</p>
            </div>
          ) : cameras.length === 0 ? (
            <div className="text-center py-8">
              <CameraIcon className="w-12 h-12 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No cameras configured</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cameras.map((camera) => (
                <button
                  key={camera.id}
                  onClick={() => setSelectedCamera(camera)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCamera?.id === camera.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{camera.name}</span>
                    <div className={camera.is_connected ? 'status-online' : 'status-offline'} />
                  </div>
                  <p className="text-xs opacity-80">{camera.location}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Video Feed */}
        <div className="lg:col-span-2 space-y-4">
          {selectedCamera ? (
            <>
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{selectedCamera.name}</h2>
                    <p className="text-sm text-gray-400">{selectedCamera.zone_name || selectedCamera.location}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`badge ${selectedCamera.is_connected ? 'badge-success' : 'badge-critical'}`}>
                      {selectedCamera.is_connected ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                </div>
                
                {/* Video Player Placeholder */}
                <div className="bg-slate-950 rounded-lg aspect-video flex items-center justify-center border-2 border-slate-700">
                  <div className="text-center">
                    <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2">Camera Feed Unavailable</p>
                    <p className="text-sm text-gray-500">
                      Connect a vision service to view live feed
                    </p>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <button className="btn-secondary flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Start Monitoring</span>
                  </button>
                </div>
              </div>

              {/* Detection Info */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Detection Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">0</p>
                    <p className="text-sm text-gray-400 mt-1">People Detected</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-500">0</p>
                    <p className="text-sm text-gray-400 mt-1">Zone Violations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-500">0</p>
                    <p className="text-sm text-gray-400 mt-1">PPE Violations</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card p-12 text-center">
              <CameraIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Select a camera to begin monitoring</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
