'use client';
import { useState, useRef, useCallback } from 'react';
import { useConfetti } from '../hooks/use-confetti';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, FileText, Download, AlertCircle, CheckCircle, X } from 'lucide-react';
import Image from 'next/image';
import Button from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisResult {
  square_feet: number
  pitch: string
  material: string
  condition: string
  damage_areas: Array<{
    type: string
    severity: string
    location: string
    area_sqft: number
  }>
  recommendations: string[]
  estimated_remaining_life: number
  repair_cost_estimate: [number, number]
  replacement_cost_estimate: [number, number]
  confidence_scores: {
    area_measurement: number
    material_identification: number
    damage_assessment: number
  }
}

type Step = 'upload' | 'analyzing' | 'results' | 'report'

export default function AIEstimator() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const triggerConfetti = useConfetti();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      setError('');
      triggerConfetti();

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [triggerConfetti]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch {
      setError('Unable to access camera. Please upload a photo instead.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'roof-capture.jpg', { type: 'image/jpeg' });
          setFile(file);
          setImagePreview(canvas.toDataURL());
          stopCamera();
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
    }
  };

  const analyzeRoof = async () => {
    if (!file) return;

    setStep('analyzing');
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    if (address) {
      formData.append('address', address);
    }
    formData.append('analysis_type', 'full');

    try {
      const response = await fetch('/api/ai/analyze-roof', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
      setStep('results');
      triggerConfetti();

      // Track successful analysis
      const win = window as unknown as { gtag?: (event: string, data: Record<string, unknown>) => void };
      if (win.gtag) {
        win.gtag('roof_analysis_complete', {
          material: data.material,
          condition: data.condition,
          square_feet: data.square_feet
        });
      }
    } catch {
      setError('Analysis failed. Please try again.');
      setStep('upload');
    }
  };

  const generateReport = async () => {
    if (!result) return;

    try {
      const response = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: result,
          address,
          include_photos: true,
          format: 'pdf'
        })
      });

      if (!response.ok) {
        throw new Error('Report generation failed');
      }

      const { report_url } = await response.json();
      setReportUrl(report_url);
      setStep('report');
      triggerConfetti();
    } catch {
      setError('Failed to generate report. Please try again.');
    }
  };

  const reset = () => {
    setStep('upload');
    setFile(null);
    setImagePreview(null);
    setResult(null);
    setAddress('');
    setError('');
    setReportUrl(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">AI Roof Analysis</h2>
              <p className="text-gray-600">
                Upload a photo or take one now for instant AI-powered analysis
              </p>
            </div>

            {/* Address Input */}
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium mb-2">
                Property Address (Optional)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, Denver, CO 80202"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Upload Options */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Drag & Drop */}
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors duration-200
                  ${isDragActive ? 'border-secondary-700 bg-secondary-700/5' : 'border-gray-300 hover:border-gray-400'}
                `}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="font-semibold mb-2">
                  {isDragActive ? 'Drop the photo here' : 'Drag & drop a roof photo'}
                </p>
                <p className="text-sm text-text-secondary">
                  or click to select from your device
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Maximum file size: 10MB
                </p>
              </div>

              {/* Camera Capture */}
              <div className="border-2 border-gray-300 rounded-lg p-8 text-center">
                {!isCapturing ? (
                  <>
                    <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="font-semibold mb-2">Take a Photo</p>
                    <p className="text-sm text-text-secondary mb-4">
                      Use your device camera for instant capture
                    </p>
                    <Button onClick={startCamera} variant="secondary" size="sm">
                      Open Camera
                    </Button>
                  </>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg mb-4"
                    />
                    <div className="flex gap-4 justify-center">
                      <Button onClick={capturePhoto} size="sm">
                        Capture
                      </Button>
                      <Button onClick={stopCamera} variant="secondary" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Preview */}
            {imagePreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6"
              >
                <h3 className="font-semibold mb-3">Selected Image</h3>
                <div className="relative max-w-md mx-auto">
                  <Image
                    src={imagePreview}
                    alt="Roof preview"
                    width={800}
                    height={600}
                    className="w-full rounded-lg shadow-lg"
                  />
                  <button
                    onClick={reset}
                    className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-6 text-center">
                  <Button onClick={analyzeRoof} size="lg">
                    Analyze Roof
                  </Button>
                </div>
              </motion.div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </motion.div>
        )}

        {step === 'analyzing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-secondary-700"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Analyzing Your Roof...</h3>
            <p className="text-gray-600">Our AI is examining the image for:</p>
            <ul className="mt-4 space-y-2 text-sm text-text-secondary">
              <li>✓ Roof dimensions and square footage</li>
              <li>✓ Material type and condition</li>
              <li>✓ Visible damage or wear</li>
              <li>✓ Estimated repair costs</li>
            </ul>
          </motion.div>
        )}

        {step === 'results' && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-bold">Analysis Results</h2>
              <Button onClick={reset} variant="secondary" size="sm">
                New Analysis
              </Button>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Square Footage</p>
                <p className="text-2xl font-bold">
                  {result.square_feet?.toLocaleString()}
                </p>
                {typeof result.confidence_scores?.area_measurement === 'number' && (
                  <p className="text-xs text-text-secondary">
                    {(result.confidence_scores.area_measurement * 100).toFixed(0)}% confidence
                  </p>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Material</p>
                <p className="text-lg font-bold capitalize">
                  {result.material || 'Unknown'}
                </p>
                {typeof result.confidence_scores?.material_identification === 'number' && (
                  <p className="text-xs text-text-secondary">
                    {(result.confidence_scores.material_identification * 100).toFixed(0)}% confidence
                  </p>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Condition</p>
                <p className="text-lg font-bold capitalize">
                  {result.condition || 'unknown'}
                </p>
                <div className={`mt-1 h-2 rounded-full bg-gray-200`}>
                  <div
                    className={`h-full rounded-full ${
                      result.condition === 'excellent' ? 'bg-accent-emerald' :
                        result.condition === 'good' ? 'bg-secondary-700/50' :
                        result.condition === 'fair' ? 'bg-yellow-500' :
                        'bg-red-500'
                    }`}
                    style={{
                      width: `${
                        result.condition === 'excellent' ? '100' :
                        result.condition === 'good' ? '75' :
                        result.condition === 'fair' ? '50' :
                        '25'
                      }%`
                    }}
                  />
                </div>
              </div>
              {result.pitch && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Pitch</p>
                  <p className="text-lg font-bold capitalize">{result.pitch}</p>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Remaining Life</p>
                <p className="text-2xl font-bold">
                  {result.estimated_remaining_life?.toLocaleString()}
                </p>
                <p className="text-xs text-text-secondary">years estimated</p>
              </div>
            </div>

            {/* Cost Estimates */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="text-secondary-700">🔧</span> Repair Estimate
                </h3>
                <p className="text-3xl font-bold mb-2">
                  ${result.repair_cost_estimate[0].toLocaleString()} -
                  ${result.repair_cost_estimate[1].toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Based on current market rates for {result.material} repair
                </p>
              </div>
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="text-accent-emerald">🏠</span> Replacement Estimate
                </h3>
                <p className="text-3xl font-bold mb-2">
                  ${result.replacement_cost_estimate[0].toLocaleString()} -
                  ${result.replacement_cost_estimate[1].toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Full replacement with {result.material} materials
                </p>
              </div>
            </div>

            {/* Damage Areas */}
            {Array.isArray(result.damage_areas) && result.damage_areas.length > 0 && (
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-2">Identified Issues</h3>
                {typeof result.confidence_scores?.damage_assessment === 'number' && (
                  <p className="text-xs text-text-secondary mb-4">
                    {(result.confidence_scores.damage_assessment * 100).toFixed(0)}% confidence
                  </p>
                )}
                <div className="space-y-3">
                  {result.damage_areas.map((damage, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`
                        mt-1 w-2 h-2 rounded-full
                        ${damage.severity === 'severe' ? 'bg-red-500' :
                          damage.severity === 'moderate' ? 'bg-yellow-500' :
                          'bg-secondary-700/50'}
                      `} />
                      <div className="flex-1">
                        <p className="font-medium">{damage.type}</p>
                        <p className="text-sm text-gray-600">
                          {damage.location} • {damage.severity} severity •
                          ~{damage.area_sqft.toLocaleString()} sq ft affected
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent-emerald mt-0.5" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button onClick={generateReport} size="lg">
                <FileText className="w-5 h-5 mr-2" />
                Generate Full Report
              </Button>
              <Button variant="secondary" size="lg">
                Get Professional Quote
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'report' && reportUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <CheckCircle className="w-16 h-16 text-accent-emerald mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Report Ready!</h3>
            <p className="text-gray-600 mb-6">
              Your comprehensive roof analysis report has been generated.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={reportUrl}
                download
                className="inline-flex items-center justify-center px-6 py-3 bg-secondary-700 text-white rounded-lg hover:bg-secondary-700/80"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Report
              </a>
              <Button onClick={reset} variant="secondary">
                Analyze Another Roof
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
