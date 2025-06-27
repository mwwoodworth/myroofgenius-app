Sprint 07 — Field Apps Integration
Objective
Deploy a suite of field-ready mobile apps that enable real-time data capture, on-site estimation, GPS-tagged documentation, and instant proposal generation—all synced with the main platform.
File Targets

pages/fieldapps.tsx
components/fieldapps/MobileScanner.tsx (create)
components/fieldapps/GPSTracker.tsx (create)
components/fieldapps/PhotoAnnotator.tsx (create)
components/fieldapps/ProposalGenerator.tsx (create)
lib/fieldapps/offline-sync.ts (create)
lib/fieldapps/image-processor.ts (create)
app/api/fieldapps/sync/route.ts (create)
types/fieldapps.ts (create)

Step-by-Step Instructions
1. Define Field App Types
typescript// types/fieldapps.ts
export interface FieldInspection {
  id: string;
  projectId: string;
  inspector: {
    id: string;
    name: string;
    certifications: string[];
  };
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
    accuracy: number;
    address?: string;
  };
  photos: InspectionPhoto[];
  measurements: Measurement[];
  notes: string;
  weatherConditions?: WeatherData;
  syncStatus: 'pending' | 'synced' | 'failed';
}

export interface InspectionPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  annotations: PhotoAnnotation[];
  metadata: {
    timestamp: Date;
    gpsLocation: GPSLocation;
    deviceInfo: string;
    orientation: number;
  };
}

export interface PhotoAnnotation {
  id: string;
  type: 'damage' | 'measurement' | 'note' | 'material';
  coordinates: { x: number; y: number };
  content: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost?: number;
}

export interface Measurement {
  id: string;
  type: 'area' | 'length' | 'pitch' | 'height';
  value: number;
  unit: 'ft' | 'm' | 'degrees';
  confidence: number;
  method: 'manual' | 'ar' | 'ai';
}
2. Create Mobile Scanner Component
tsx// components/fieldapps/MobileScanner.tsx
import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassPanel from '@/components/ui/GlassPanel';

interface MobileScannerProps {
  onScanComplete: (data: any) => void;
  scanMode: 'damage' | 'measurement' | 'material';
}

export default function MobileScanner({ onScanComplete, scanMode }: MobileScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [detectedItems, setDetectedItems] = useState([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScan = useCallback(async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Simulate AI processing
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            processScanResults();
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    } catch (error) {
      console.error('Camera access error:', error);
      setIsScanning(false);
    }
  }, [scanMode]);

  const processScanResults = async () => {
    // Capture frame from video
    if (canvasRef.current && videoRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      
      // Send to AI for analysis
      const imageData = canvasRef.current.toDataURL('image/jpeg');
      const results = await analyzeImage(imageData, scanMode);
      
      setDetectedItems(results);
      onScanComplete(results);
    }
    
    setIsScanning(false);
  };

  const analyzeImage = async (imageData: string, mode: string) => {
    // AI analysis implementation
    const response = await fetch('/api/fieldapps/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData, mode })
    });
    
    return response.json();
  };

  return (
    <GlassPanel className="relative h-[600px] overflow-hidden">
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="hidden"
          width={1920}
          height={1080}
        />
        
        {/* Scan overlay */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
            >
              {/* Scanning animation */}
              <motion.div
                animate={{ y: ['0%', '100%', '0%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
              />
              
              {/* Progress indicator */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="glass-panel p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      Analyzing {scanMode}...
                    </span>
                    <span className="text-sm">{scanProgress}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detected items overlay */}
        {detectedItems.map((item: any, idx) => (
          <motion.div
            key={idx}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute glass-panel p-2 rounded-lg"
            style={{ left: item.x, top: item.y }}
          >
            <div className="flex items-center gap-2">
              {item.severity === 'critical' && (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
        {!isScanning ? (
          <>
            <button
              onClick={startScan}
              className="glass-button-primary px-6 py-3 rounded-full flex items-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Start Scan
            </button>
            <button className="glass-button px-6 py-3 rounded-full flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Photo
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsScanning(false)}
            className="glass-button px-6 py-3 rounded-full"
          >
            Cancel
          </button>
        )}
      </div>
    </GlassPanel>
  );
}
3. Create GPS Tracker Component
tsx// components/fieldapps/GPSTracker.tsx
import { useState, useEffect } from 'react';
import { MapPin, Navigation, Signal } from 'lucide-react';
import GlassPanel from '@/components/ui/GlassPanel';

interface GPSTrackerProps {
  onLocationUpdate: (location: GeolocationPosition) => void;
  autoTrack?: boolean;
}

export default function GPSTracker({ onLocationUpdate, autoTrack = true }: GPSTrackerProps) {
  const [location, setLocation] = useState<GeolocationPosition | null>(null);
  const [accuracy, setAccuracy] = useState<'high' | 'medium' | 'low'>('low');
  const [isTracking, setIsTracking] = useState(autoTrack);

  useEffect(() => {
    if (!isTracking) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation(position);
        onLocationUpdate(position);
        
        // Update accuracy indicator
        if (position.coords.accuracy < 10) {
          setAccuracy('high');
        } else if (position.coords.accuracy < 50) {
          setAccuracy('medium');
        } else {
          setAccuracy('low');
        }
      },
      (error) => console.error('GPS error:', error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking, onLocationUpdate]);

  const getAccuracyColor = () => {
    switch (accuracy) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-red-500';
    }
  };

  return (
    <GlassPanel className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          GPS Location
        </h3>
        <button
          onClick={() => setIsTracking(!isTracking)}
          className={`px-3 py-1 rounded-full text-sm ${
            isTracking ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20'
          }`}
        >
          {isTracking ? 'Tracking' : 'Paused'}
        </button>
      </div>

      {location && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Latitude</span>
            <span className="font-mono">{location.coords.latitude.toFixed(6)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Longitude</span>
            <span className="font-mono">{location.coords.longitude.toFixed(6)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Accuracy</span>
            <div className="flex items-center gap-2">
              <Signal className={`w-4 h-4 ${getAccuracyColor()}`} />
              <span className="font-mono">{location.coords.accuracy.toFixed(0)}m</span>
            </div>
          </div>
        </div>
      )}

      <button className="w-full mt-4 glass-button py-2 rounded-lg flex items-center justify-center gap-2">
        <MapPin className="w-4 h-4" />
        Tag Current Location
      </button>
    </GlassPanel>
  );
}
4. Create Offline Sync Manager
typescript// lib/fieldapps/offline-sync.ts
import { openDB, IDBPDatabase } from 'idb';
import { FieldInspection } from '@/types/fieldapps';

interface SyncQueueItem {
  id: string;
  type: 'inspection' | 'photo' | 'measurement';
  data: any;
  timestamp: Date;
  retries: number;
}

export class OfflineSyncManager {
  private db: IDBPDatabase | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  async initialize() {
    this.db = await openDB('FieldAppsDB', 1, {
      upgrade(db) {
        // Create object stores
        if (!db.objectStoreNames.contains('inspections')) {
          db.createObjectStore('inspections', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id' });
        }
      }
    });

    // Start sync process
    this.startAutoSync();
  }

  async saveInspection(inspection: FieldInspection) {
    if (!this.db) return;

    // Save to local DB
    await this.db.put('inspections', inspection);

    // Add to sync queue
    await this.addToSyncQueue({
      id: `sync_${inspection.id}`,
      type: 'inspection',
      data: inspection,
      timestamp: new Date(),
      retries: 0
    });
  }

  async addToSyncQueue(item: SyncQueueItem) {
    if (!this.db) return;
    await this.db.put('syncQueue', item);
  }

  private startAutoSync() {
    // Check connection and sync every 30 seconds
    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncPendingItems();
      }
    }, 30000);

    // Sync immediately if online
    if (navigator.onLine) {
      this.syncPendingItems();
    }
  }

  private async syncPendingItems() {
    if (!this.db) return;

    const tx = this.db.transaction('syncQueue', 'readonly');
    const items = await tx.objectStore('syncQueue').getAll();

    for (const item of items) {
      try {
        await this.syncItem(item);
        
        // Remove from queue on success
        await this.db.delete('syncQueue', item.id);
      } catch (error) {
        console.error('Sync failed for item:', item.id, error);
        
        // Increment retry count
        item.retries++;
        if (item.retries < 3) {
          await this.db.put('syncQueue', item);
        }
      }
    }
  }

  private async syncItem(item: SyncQueueItem) {
    const endpoint = `/api/fieldapps/sync/${item.type}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item.data)
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }

    return response.json();
  }

  async getOfflineInspections(): Promise<FieldInspection[]> {
    if (!this.db) return [];
    return this.db.getAll('inspections');
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.db?.close();
  }
}
5. Update Field Apps Page
tsx// pages/fieldapps.tsx
import { useState, useEffect } from 'react';
import MobileScanner from '@/components/fieldapps/MobileScanner';
import GPSTracker from '@/components/fieldapps/GPSTracker';
import PhotoAnnotator from '@/components/fieldapps/PhotoAnnotator';
import ProposalGenerator from '@/components/fieldapps/ProposalGenerator';
import { OfflineSyncManager } from '@/lib/fieldapps/offline-sync';
import GlassPanel from '@/components/ui/GlassPanel';
import { Smartphone, Cloud, WifiOff, CheckCircle } from 'lucide-react';

export default function FieldApps() {
  const [activeApp, setActiveApp] = useState<'scanner' | 'gps' | 'annotator' | 'proposal'>('scanner');
  const [syncManager, setSyncManager] = useState<OfflineSyncManager | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentInspection, setCurrentInspection] = useState(null);

  useEffect(() => {
    // Initialize offline sync
    const manager = new OfflineSyncManager();
    manager.initialize();
    setSyncManager(manager);

    // Monitor online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      manager.destroy();
    };
  }, []);

  const apps = [
    { id: 'scanner', name: 'AI Scanner', icon: '📸' },
    { id: 'gps', name: 'GPS Tracker', icon: '📍' },
    { id: 'annotator', name: 'Photo Notes', icon: '✏️' },
    { id: 'proposal', name: 'Quick Quote', icon: '📄' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Status Bar */}
        <GlassPanel className="mb-6 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Smartphone className="w-6 h-6" />
              Field Apps
            </h1>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                isOnline ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
              }`}>
                {isOnline ? <Cloud className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                <span className="text-sm">{isOnline ? 'Online' : 'Offline Mode'}</span>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* App Selector */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => setActiveApp(app.id as any)}
              className={`glass-panel p-6 rounded-xl transition-all ${
                activeApp === app.id ? 'ring-2 ring-blue-500 glass-hover-glow' : ''
              }`}
            >
              <div className="text-4xl mb-2">{app.icon}</div>
              <div className="font-medium">{app.name}</div>
            </button>
          ))}
        </div>

        {/* Active App */}
        <div className="max-w-4xl mx-auto">
          {activeApp === 'scanner' && (
            <MobileScanner
              scanMode="damage"
              onScanComplete={(data) => {
                console.log('Scan complete:', data);
                // Save to offline sync
                syncManager?.saveInspection({
                  ...currentInspection,
                  photos: data
                });
              }}
            />
          )}

          {activeApp === 'gps' && (
            <GPSTracker
              onLocationUpdate={(location) => {
                setCurrentInspection(prev => ({
                  ...prev,
                  location: {
                    lat: location.coords.latitude,
                    lng: location.coords.longitude,
                    accuracy: location.coords.accuracy
                  }
                }));
              }}
            />
          )}

          {activeApp === 'annotator' && (
            <PhotoAnnotator
              photos={currentInspection?.photos || []}
              onAnnotationsUpdate={(annotations) => {
                console.log('Annotations updated:', annotations);
              }}
            />
          )}

          {activeApp === 'proposal' && (
            <ProposalGenerator
              inspection={currentInspection}
              onGenerate={(proposal) => {
                console.log('Proposal generated:', proposal);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
Commit Message
feat(fieldapps): integrated mobile field apps with offline sync, GPS tracking, and AI-powered photo analysis
QA/Acceptance Checklist

 Camera scanner works on mobile devices with proper permissions
 GPS tracking shows accurate location with signal strength
 Photos can be annotated with damage markers and notes
 Offline mode queues data for sync when connection returns
 Proposal generator creates PDF with inspection data
 All field apps have glassmorphic UI consistent with platform
 Touch gestures work smoothly on mobile devices

AI Execution Block
Codex/Operator Instructions:

Install required dependencies: npm install idb react-webcam
Set up service worker for offline functionality
Configure camera permissions in next.config.js
Test on actual mobile devices (iOS and Android)
Verify GPS accuracy in various conditions
Ensure IndexedDB works across browsers
Deploy with proper SSL for camera/GPS access

Advanced/Optional Enhancements

Add AR measurement tools using device sensors
Implement voice-to-text for field notes
Create team collaboration features for multi-inspector projects
Add weather API integration for automatic condition logging
Build native mobile apps with React Native