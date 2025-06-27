# Sprint 03 — AR/3D Roof Viewer Integration

## Objective
Deploy an AR/3D visualization system that prevents costly measurement errors and specification misunderstandings. This isn't about impressive graphics — it's about giving estimators, contractors, and building owners a shared reality where everyone sees the same roof, the same way, eliminating the gaps where profits disappear.

## Why This Matters
Measurement discrepancies cause 31% of roofing change orders. When an estimator sees 12,000 sq ft but the field measures 13,500 sq ft, someone absorbs a $15,000 loss. The AR/3D Viewer creates a single source of visual truth — protecting margins and relationships.

## What This Protects
- **Estimators** from satellite photo distortions and accessibility blind spots
- **Contractors** from surprise complexity discovered during tear-off
- **Building owners** from scope creep and disputed measurements
- **Architects** from specification misinterpretation

## File Targets
- `components/ar/ARViewer.tsx` (new)
- `components/ar/RoofModel.tsx` (new)
- `components/ar/MeasurementOverlay.tsx` (new)
- `lib/ar/model-loader.ts` (new)
- `lib/ar/measurement-engine.ts` (new)
- `pages/project/[id]/viewer.tsx` (new)
- `pages/estimator.tsx` (update)
- `hooks/useARViewer.ts` (new)
- `types/ar.ts` (new)

## Step-by-Step Instructions

### 1. Define AR/3D Types and Measurement Standards
Establish the protective measurement framework:

```typescript
// types/ar.ts
export interface RoofModel {
  id: string
  projectId: string
  source: 'satellite' | 'drone' | 'lidar' | 'manual'
  accuracy: {
    horizontal: number // feet
    vertical: number // feet
    confidence: number // 0-100
  }
  measurements: {
    totalArea: number
    sections: RoofSection[]
    edges: EdgeMeasurement[]
    penetrations: Penetration[]
  }
  warnings: ModelWarning[]
  generatedAt: Date
  validatedBy?: string
}

export interface RoofSection {
  id: string
  type: 'gable' | 'hip' | 'flat' | 'shed' | 'mansard' | 'complex'
  area: number
  pitch: string // e.g., "4:12"
  material?: {
    existing: string
    recommended?: string[]
  }
  condition: {
    status: 'good' | 'fair' | 'poor' | 'failing'
    issues: string[]
    photos: string[]
  }
}

export interface EdgeMeasurement {
  id: string
  type: 'eave' | 'rake' | 'ridge' | 'hip' | 'valley'
  length: number
  height: number
  flashingRequired: boolean
  accessNotes?: string
}

export interface Penetration {
  id: string
  type: 'vent' | 'chimney' | 'skylight' | 'hvac' | 'solar' | 'other'
  dimensions: { width: number; height: number }
  flashingType: string
  condition: 'good' | 'needs-repair' | 'needs-replacement'
  photo?: string
}

export interface ModelWarning {
  type: 'measurement-uncertainty' | 'access-restriction' | 'structural-concern' | 'code-compliance'
  severity: 'high' | 'medium' | 'low'
  message: string
  affectedArea?: number
  remediation?: string
}

export interface ViewerState {
  mode: '3d' | 'ar' | 'measurements' | 'conditions'
  selectedSection: string | null
  measurementVisible: boolean
  annotations: Annotation[]
  viewAngle: { azimuth: number; elevation: number }
  zoom: number
}
```

### 2. Build the Model Loader
Create the protective model loading system:

```typescript
// lib/ar/model-loader.ts
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { RoofModel, ModelWarning } from '@/types/ar'

export class ModelLoader {
  private loader: GLTFLoader
  private dracoLoader: DRACOLoader
  
  constructor() {
    this.dracoLoader = new DRACOLoader()
    this.dracoLoader.setDecoderPath('/draco/')
    
    this.loader = new GLTFLoader()
    this.loader.setDRACOLoader(this.dracoLoader)
  }
  
  async loadRoofModel(modelUrl: string): Promise<{
    scene: THREE.Scene
    model: RoofModel
    warnings: ModelWarning[]
  }> {
    try {
      // Load 3D model
      const gltf = await this.loader.loadAsync(modelUrl)
      const scene = gltf.scene
      
      // Extract metadata
      const metadata = gltf.userData as RoofModel
      
      // Validate model integrity
      const warnings = this.validateModel(scene, metadata)
      
      // Apply protective materials
      this.applyProtectiveMaterials(scene, metadata)
      
      // Add measurement helpers
      this.addMeasurementHelpers(scene, metadata)
      
      return { scene, model: metadata, warnings }
    } catch (error) {
      console.error('Model loading error:', error)
      throw new Error('Failed to load roof model. Ensure file is valid GLTF/GLB format.')
    }
  }
  
  private validateModel(scene: THREE.Scene, metadata: RoofModel): ModelWarning[] {
    const warnings: ModelWarning[] = []
    
    // Check accuracy confidence
    if (metadata.accuracy.confidence < 85) {
      warnings.push({
        type: 'measurement-uncertainty',
        severity: 'medium',
        message: `Measurement confidence is ${metadata.accuracy.confidence}%. Consider field verification for critical dimensions.`,
        remediation: 'Schedule drone flight or manual measurement for sections over 1,000 sq ft'
      })
    }
    
    // Check for missing sections
    const meshes = scene.children.filter(child => child instanceof THREE.Mesh)
    if (meshes.length < metadata.measurements.sections.length) {
      warnings.push({
        type: 'measurement-uncertainty',
        severity: 'high',
        message: 'Model geometry doesn't match section count. Some areas may not be visible.',
        affectedArea: metadata.measurements.sections.reduce((sum, s) => sum + s.area, 0) * 0.1
      })
    }
    
    // Check for steep slopes
    const steepSections = metadata.measurements.sections.filter(s => {
      const pitch = parseInt(s.pitch.split(':')[0])
      return pitch > 9
    })
    
    if (steepSections.length > 0) {
      warnings.push({
        type: 'access-restriction',
        severity: 'high',
        message: `${steepSections.length} sections have pitch >9:12. Safety equipment and experienced crew required.`,
        affectedArea: steepSections.reduce((sum, s) => sum + s.area, 0)
      })
    }
    
    return warnings
  }
  
  private applyProtectiveMaterials(scene: THREE.Scene, metadata: RoofModel) {
    // Color-code by condition
    const conditionColors = {
      good: new THREE.Color(0x4ade80), // green
      fair: new THREE.Color(0xfbbf24), // amber
      poor: new THREE.Color(0xf87171), // red
      failing: new THREE.Color(0x991b1b) // dark red
    }
    
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const section = metadata.measurements.sections.find(
          s => s.id === child.userData.sectionId
        )
        
        if (section) {
          const color = conditionColors[section.condition.status]
          child.material = new THREE.MeshPhysicalMaterial({
            color,
            roughness: 0.7,
            metalness: 0.1,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
          })
          
          // Add edge highlighting for problem areas
          if (section.condition.status === 'poor' || section.condition.status === 'failing') {
            const edges = new THREE.EdgesGeometry(child.geometry)
            const line = new THREE.LineSegments(
              edges,
              new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 })
            )
            child.add(line)
          }
        }
      }
    })
  }
  
  private addMeasurementHelpers(scene: THREE.Scene, metadata: RoofModel) {
    // Add dimension lines
    metadata.measurements.edges.forEach(edge => {
      const points = edge.userData?.points as THREE.Vector3[]
      if (points && points.length === 2) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points)
        const material = new THREE.LineBasicMaterial({ 
          color: 0x0066cc,
          linewidth: 2,
          depthTest: false
        })
        const line = new THREE.Line(geometry, material)
        line.userData = { edgeId: edge.id, length: edge.length }
        scene.add(line)
      }
    })
    
    // Add area labels (sprites for always-facing text)
    metadata.measurements.sections.forEach(section => {
      const center = section.userData?.center as THREE.Vector3
      if (center) {
        const canvas = this.createTextCanvas(
          `${section.area.toLocaleString()} sq ft\n${section.pitch}`,
          section.condition.status
        )
        const texture = new THREE.CanvasTexture(canvas)
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
        const sprite = new THREE.Sprite(spriteMaterial)
        sprite.position.copy(center)
        sprite.scale.set(10, 5, 1)
        scene.add(sprite)
      }
    })
  }
  
  private createTextCanvas(text: string, condition: string): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    canvas.width = 256
    canvas.height = 128
    
    // Background
    context.fillStyle = condition === 'good' ? '#10b981' : '#ef4444'
    context.fillRect(0, 0, canvas.width, canvas.height)
    
    // Text
    context.fillStyle = 'white'
    context.font = 'bold 24px Inter'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    
    const lines = text.split('\n')
    lines.forEach((line, i) => {
      context.fillText(line, canvas.width / 2, canvas.height / 2 + (i - 0.5) * 30)
    })
    
    return canvas
  }
}
```

### 3. Build the Measurement Engine
Create the protective measurement verification system:

```typescript
// lib/ar/measurement-engine.ts
import { RoofModel, RoofSection, EdgeMeasurement, ModelWarning } from '@/types/ar'

export class MeasurementEngine {
  private readonly SAFETY_FACTOR = 1.05 // 5% safety margin
  private readonly WASTE_FACTORS = {
    shingle: 1.10, // 10% waste
    metal: 1.05, // 5% waste
    tile: 1.15, // 15% waste
    membrane: 1.08 // 8% waste
  }
  
  calculateMaterialRequirements(model: RoofModel, materialType: keyof typeof this.WASTE_FACTORS) {
    const baseSqFt = model.measurements.totalArea
    const wasteFactor = this.WASTE_FACTORS[materialType]
    const safetyFactor = this.SAFETY_FACTOR
    
    const totalRequired = baseSqFt * wasteFactor * safetyFactor
    const squares = Math.ceil(totalRequired / 100) // Roofing "square" = 100 sq ft
    
    // Calculate additional materials
    const ridgeLength = model.measurements.edges
      .filter(e => e.type === 'ridge' || e.type === 'hip')
      .reduce((sum, e) => sum + e.length, 0)
    
    const valleyLength = model.measurements.edges
      .filter(e => e.type === 'valley')
      .reduce((sum, e) => sum + e.length, 0)
    
    const eaveLength = model.measurements.edges
      .filter(e => e.type === 'eave')
      .reduce((sum, e) => sum + e.length, 0)
    
    // Protective calculations - always round up
    return {
      primaryMaterial: {
        squares,
        sqFt: totalRequired,
        bundles: Math.ceil(squares * 3), // Typical 3 bundles per square
        pallets: Math.ceil(squares / 30) // Typical 30 squares per pallet
      },
      accessories: {
        ridgeCap: Math.ceil(ridgeLength / 20) * 1.1, // 20 LF per bundle + 10% waste
        valleyMembrane: Math.ceil(valleyLength) * 1.15, // 15% waste for valleys
        dripEdge: Math.ceil(eaveLength / 10) * 1.05, // 10 LF sections + 5% waste
        underlayment: Math.ceil(totalRequired / 400) * 1.1, // 400 sq ft rolls + 10% waste
        nails: Math.ceil(squares * 4) // 4 lbs per square average
      },
      warnings: this.generateMaterialWarnings(model, materialType)
    }
  }
  
  private generateMaterialWarnings(model: RoofModel, materialType: string): ModelWarning[] {
    const warnings: ModelWarning[] = []
    
    // Check for complex roofs requiring more waste
    const complexSections = model.measurements.sections.filter(s => s.type === 'complex')
    if (complexSections.length > 0) {
      warnings.push({
        type: 'measurement-uncertainty',
        severity: 'medium',
        message: `Complex roof sections detected. Consider adding 5% to material order.`,
        affectedArea: complexSections.reduce((sum, s) => sum + s.area, 0),
        remediation: 'Order extra bundles for cut waste on complex sections'
      })
    }
    
    // Check for high penetration count
    if (model.measurements.penetrations.length > 10) {
      warnings.push({
        type: 'measurement-uncertainty',
        severity: 'low',
        message: `High penetration count (${model.measurements.penetrations.length}). Additional flashing materials needed.`,
        remediation: 'Add 1 gallon flashing cement per 5 penetrations'
      })
    }
    
    return warnings
  }
  
  verifyFieldMeasurements(model: RoofModel, fieldMeasurements: Partial<RoofModel['measurements']>) {
    const discrepancies: ModelWarning[] = []
    
    if (fieldMeasurements.totalArea) {
      const difference = Math.abs(model.measurements.totalArea - fieldMeasurements.totalArea)
      const percentDiff = (difference / model.measurements.totalArea) * 100
      
      if (percentDiff > 5) {
        discrepancies.push({
          type: 'measurement-uncertainty',
          severity: 'high',
          message: `Field measurement differs by ${percentDiff.toFixed(1)}% (${difference.toFixed(0)} sq ft)`,
          affectedArea: difference,
          remediation: 'Use field measurements for material ordering. Update model for documentation.'
        })
      }
    }
    
    return {
      isValid: discrepancies.filter(d => d.severity === 'high').length === 0,
      discrepancies,
      recommendedAction: discrepancies.length > 0 
        ? 'Schedule re-measurement with crew lead present'
        : 'Measurements verified within acceptable tolerance'
    }
  }
}
```

### 4. Build the AR Viewer Component
Create the protective visualization interface:

```tsx
// components/ar/ARViewer.tsx
import { useRef, useEffect, useState } from 'react'
import { Canvas, useThree, useLoader } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, Text } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Maximize2, Minimize2, Ruler, Camera, AlertTriangle, 
  Info, Download, Share2, RotateCw 
} from 'lucide-react'
import { useARViewer } from '@/hooks/useARViewer'
import GlassPanel from '@/components/ui/GlassPanel'
import Button from '@/components/ui/Button'
import MeasurementOverlay from './MeasurementOverlay'
import { ModelLoader } from '@/lib/ar/model-loader'
import { ViewerState } from '@/types/ar'

interface ARViewerProps {
  projectId: string
  modelUrl: string
  onMeasurementUpdate?: (measurements: any) => void
}

export default function ARViewer({ projectId, modelUrl, onMeasurementUpdate }: ARViewerProps) {
  const {
    model,
    viewerState,
    warnings,
    loading,
    error,
    setMode,
    toggleMeasurements,
    selectSection,
    addAnnotation
  } = useARViewer(projectId, modelUrl)
  
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showWarnings, setShowWarnings] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const handleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen()
    } else if (document.fullscreenElement) {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }
  
  const handleScreenshot = () => {
    const canvas = containerRef.current?.querySelector('canvas')
    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `roof-model-${projectId}-${Date.now()}.png`
          a.click()
          URL.revokeObjectURL(url)
        }
      })
    }
  }
  
  if (loading) {
    return (
      <GlassPanel className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading protective visualization...
          </p>
        </div>
      </GlassPanel>
    )
  }
  
  if (error) {
    return (
      <GlassPanel className="h-96 flex items-center justify-center" protective>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-sm text-red-600 dark:text-red-400 mb-2">
            {error}
          </p>
          <Button size="sm" onClick={() => window.location.reload()}>
            Retry Loading
          </Button>
        </div>
      </GlassPanel>
    )
  }
  
  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[600px]">
      <GlassPanel className="absolute inset-0" glow>
        {/* 3D Canvas */}
        <Canvas
          camera={{ position: [50, 50, 50], fov: 45 }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="city" />
          
          {model && (
            <RoofModelComponent 
              model={model}
              viewerState={viewerState}
              onSectionClick={selectSection}
            />
          )}
          
          {viewerState.mode === '3d' && (
            <>
              <Grid args={[200, 200]} />
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                maxPolarAngle={Math.PI / 2}
              />
            </>
          )}
        </Canvas>
        
        {/* Measurement Overlay */}
        {viewerState.measurementVisible && model && (
          <MeasurementOverlay
            model={model}
            selectedSection={viewerState.selectedSection}
            onClose={() => toggleMeasurements()}
          />
        )}
        
        {/* Control Panel */}
        <div className="absolute top-4 left-4 space-y-2">
          <GlassPanel className="p-2" variant="elevated">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewerState.mode === '3d' ? 'primary' : 'glass'}
                onClick={() => setMode('3d')}
                className="px-3"
              >
                3D
              </Button>
              <Button
                size="sm"
                variant={viewerState.mode === 'ar' ? 'primary' : 'glass'}
                onClick={() => setMode('ar')}
                className="px-3"
              >
                AR
              </Button>
              <Button
                size="sm"
                variant={viewerState.mode === 'measurements' ? 'primary' : 'glass'}
                onClick={() => setMode('measurements')}
                className="px-3"
              >
                <Ruler className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewerState.mode === 'conditions' ? 'primary' : 'glass'}
                onClick={() => setMode('conditions')}
                className="px-3"
              >
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </GlassPanel>
          
          {/* Model Info */}
          {model && (
            <GlassPanel className="p-3 text-sm" variant="elevated">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Area:</span>
                  <span className="font-medium">{model.measurements.totalArea.toLocaleString()} sq ft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Sections:</span>
                  <span className="font-medium">{model.measurements.sections.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                  <span className={`font-medium ${
                    model.accuracy.confidence > 90 ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {model.accuracy.confidence}%
                  </span>
                </div>
              </div>
            </GlassPanel>
          )}
        </div>
        
        {/* Action Panel */}
        <div className="absolute top-4 right-4 space-y-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="glass"
              onClick={handleFullscreen}
              className="p-2"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="glass"
              onClick={handleScreenshot}
              className="p-2"
            >
              <Camera className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="glass"
              onClick={() => {/* Share logic */}}
              className="p-2"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Warnings Panel */}
        {warnings.length > 0 && showWarnings && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-4 left-4 right-4 max-w-md"
          >
            <GlassPanel variant="elevated" protective className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h4 className="font-medium">Protective Warnings</h4>
                </div>
                <Button
                  size="sm"
                  variant="glass"
                  onClick={() => setShowWarnings(false)}
                  className="p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {warnings.map((warning, index) => (
                  <div
                    key={index}
                    className={`text-sm p-2 rounded-lg ${
                      warning.severity === 'high' 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        : warning.severity === 'medium'
                        ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    <p className="font-medium">{warning.message}</p>
                    {warning.remediation && (
                      <p className="text-xs mt-1 opacity-80">
                        Action: {warning.remediation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </GlassPanel>
    </div>
  )
}

// Internal component for 3D model rendering
function RoofModelComponent({ model, viewerState, onSectionClick }: any) {
  const { scene } = useThree()
  const modelRef = useRef<THREE.Group>()
  
  useEffect(() => {
    // Load and setup model
    const loader = new ModelLoader()
    loader.loadRoofModel(model.url).then(({ scene: loadedScene }) => {
      if (modelRef.current) {
        modelRef.current.add(loadedScene)
      }
    })
  }, [model])
  
  return <group ref={modelRef} />
}
```

### 5. Create Measurement Overlay
Build the protective measurement interface:

```tsx
// components/ar/MeasurementOverlay.tsx
import { motion } from 'framer-motion'
import { X, AlertCircle, CheckCircle } from 'lucide-react'
import { RoofModel, RoofSection } from '@/types/ar'
import GlassPanel from '@/components/ui/GlassPanel'
import Button from '@/components/ui/Button'

interface MeasurementOverlayProps {
  model: RoofModel
  selectedSection: string | null
  onClose: () => void
}

export default function MeasurementOverlay({
  model,
  selectedSection,
  onClose
}: MeasurementOverlayProps) {
  const section = selectedSection 
    ? model.measurements.sections.find(s => s.id === selectedSection)
    : null
    
  const allSections = model.measurements.sections
  
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="absolute top-0 right-0 h-full w-96 max-w-full p-4 overflow-y-auto"
    >
      <GlassPanel variant="elevated" className="h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold">Protective Measurements</h3>
          <Button size="sm" variant="glass" onClick={onClose} className="p-1">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Total Summary */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            Total Project Measurements
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Area</p>
              <p className="text-lg font-semibold">
                {model.measurements.totalArea.toLocaleString()} sq ft
              </p>
            </div>
            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Roofing Squares</p>
              <p className="text-lg font-semibold">
                {Math.ceil(model.measurements.totalArea / 100)}
              </p>
            </div>
            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Edge Total</p>
              <p className="text-lg font-semibold">
                {model.measurements.edges.reduce((sum, e) => sum + e.length, 0).toFixed(0)} LF
              </p>
            </div>
            <div className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Penetrations</p>
              <p className="text-lg font-semibold">
                {model.measurements.penetrations.length}
              </p>
            </div>
          </div>
        </div>
        
        {/* Section Details */}
        {section ? (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Selected Section Details
            </h4>
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Type:</span>
                <span className="font-medium capitalize">{section.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Area:</span>
                <span className="font-medium">{section.area.toLocaleString()} sq ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pitch:</span>
                <span className="font-medium">{section.pitch}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Condition:</span>
                <span className={`font-medium flex items-center gap-1 ${
                  section.condition.status === 'good' ? 'text-green-600' :
                  section.condition.status === 'fair' ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  {section.condition.status === 'good' ? 
                    <CheckCircle className="w-4 h-4" /> : 
                    <AlertCircle className="w-4 h-4" />
                  }
                  {section.condition.status}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              All Sections
            </h4>
            <div className="space-y-2">
              {allSections.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg flex justify-between items-center hover:bg-white/70 dark:hover:bg-gray-800/70 cursor-pointer transition-colors"
                >
                  <div>
                    <p className="font-medium capitalize">{s.type}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {s.area.toLocaleString()} sq ft • {s.pitch}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    s.condition.status === 'good' ? 'bg-green-500' :
                    s.condition.status === 'fair' ? 'bg-amber-500' :
                    'bg-red-500'
                  }`} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Accuracy Notice */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Measurements based on {model.source} data with ±{model.accuracy.horizontal}ft accuracy. 
              Always verify critical dimensions in field before material ordering.
            </p>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  )
}
```

### 6. Create AR Viewer Hook
Manage viewer state and interactions:

```tsx
// hooks/useARViewer.ts
import { useState, useEffect } from 'react'
import { RoofModel, ViewerState, ModelWarning } from '@/types/ar'
import { ModelLoader } from '@/lib/ar/model-loader'
import { MeasurementEngine } from '@/lib/ar/measurement-engine'

export function useARViewer(projectId: string, modelUrl: string) {
  const [model, setModel] = useState<RoofModel | null>(null)
  const [viewerState, setViewerState] = useState<ViewerState>({
    mode: '3d',
    selectedSection: null,
    measurementVisible: false,
    annotations: [],
    viewAngle: { azimuth: 45, elevation: 45 },
    zoom: 1
  })
  const [warnings, setWarnings] = useState<ModelWarning[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    loadModel()
  }, [modelUrl])
  
  const loadModel = async () => {
    if (!process.env.NEXT_PUBLIC_AR_MODE_ENABLED) {
      setError('AR mode is currently disabled')
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const loader = new ModelLoader()
      const { scene, model: loadedModel, warnings: modelWarnings } = await loader.loadRoofModel(modelUrl)
      
      setModel(loadedModel)
      setWarnings(modelWarnings)
      
      // Auto-show warnings if high severity
      const hasHighSeverity = modelWarnings.some(w => w.severity === 'high')
      if (hasHighSeverity) {
        // Trigger warning display in parent
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Model loading error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load model')
      setLoading(false)
    }
  }
  
  const setMode = (mode: ViewerState['mode']) => {
    setViewerState(prev => ({ ...prev, mode }))
  }
  
  const toggleMeasurements = () => {
    setViewerState(prev => ({ 
      ...prev, 
      measurementVisible: !prev.measurementVisible 
    }))
  }
  
  const selectSection = (sectionId: string | null) => {
    setViewerState(prev => ({ 
      ...prev, 
      selectedSection: sectionId 
    }))
  }
  
  const addAnnotation = (annotation: any) => {
    setViewerState(prev => ({ 
      ...prev, 
      annotations: [...prev.annotations, annotation] 
    }))
  }
  
  return {
    model,
    viewerState,
    warnings,
    loading,
    error,
    setMode,
    toggleMeasurements,
    selectSection,
    addAnnotation
  }
}
```

## Commit Message
```
feat(ar): implemented protective AR/3D roof visualization system

- Built ModelLoader with validation and protective warnings
- Created MeasurementEngine with safety factors and waste calculations
- Implemented interactive ARViewer with condition color-coding
- Added MeasurementOverlay for detailed section analysis
- Protects against measurement errors and specification gaps
```

## QA/Acceptance Checklist
- [ ] 3D model loads and displays within 3 seconds
- [ ] Roof sections color-coded by condition (green/amber/red)
- [ ] Measurements visible with proper units and formatting
- [ ] Warnings appear for accuracy <85% or steep slopes
- [ ] Touch/click selects sections and shows details
- [ ] Screenshot functionality captures current view
- [ ] Mobile view maintains usability with touch controls
- [ ] AR mode activates device camera (where supported)
- [ ] Material calculations include proper waste factors
- [ ] Feature flag `AR_MODE_ENABLED` controls visibility

## AI Execution Block

### Codex/Operator Instructions:
1. Install Three.js dependencies: `npm install three @react-three/fiber @react-three/drei`
2. Create all type definitions in `types/ar.ts`
3. Implement ModelLoader class with protective validation
4. Build MeasurementEngine with safety calculations
5. Create ARViewer component with full interactivity
6. Implement MeasurementOverlay for detailed views
7. Create useARViewer hook for state management
8. Add sample 3D model to public folder for testing
9. Test with various roof types and conditions
10. Verify protective warnings trigger appropriately
11. Commit with provided message and deploy

**Operator Validation**: Load a complex roof model with >10:12 pitch sections. Confirm high-severity access warning appears. Click a section marked "poor" condition - verify it shows red with edge highlighting. Take screenshot and confirm it saves properly.

## Advanced/Optional Enhancements

### AR Mode Implementation
```typescript
// Enable WebXR for true AR
const handleARMode = async () => {
  if ('xr' in navigator) {
    const session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test', 'dom-overlay'],
      domOverlay: { root: document.body }
    })
    // AR session setup
  }
}
```

### Real-time Collaboration
```typescript
// Add multi-user annotations
const collaborationSocket = new WebSocket(process.env.NEXT_PUBLIC_COLLAB_WS)
collaborationSocket.on('annotation', (data) => {
  addAnnotation({
    ...data,
    user: data.userId,
    timestamp: new Date()
  })
})
```

### AI-Powered Insights
```typescript
// Generate protective insights from model
const generateInsights = async (model: RoofModel) => {
  const insights = await fetch('/api/ai/analyze-roof', {
    method: 'POST',
    body: JSON.stringify({ model })
  })
  
  return insights.json() // Returns risk areas, optimal approach paths, etc.
}
```

---

**Reference**: See [QUANTUM_LEAP_CONTEXT.md](/docs/QUANTUM_LEAP_CONTEXT.md) for AR integration standards and protective visualization principles.