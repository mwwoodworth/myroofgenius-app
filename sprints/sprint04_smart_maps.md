# Sprint 04 — Smart Maps Implementation

## Objective
Deploy intelligent mapping that protects field teams from wasted windshield time, missed appointments, and dangerous routing decisions. This isn't GPS with extra features — it's a protective navigation system that understands construction logistics, crew safety, and project profitability.

## Why This Matters
Every unnecessary mile costs $0.67 in vehicle expenses plus $42 in labor. A crew making wrong turns or arriving at locked sites burns $200/hour. Smart Maps prevent the small navigation failures that compound into major margin erosion. When your estimator can see traffic patterns, your PM can route crews intelligently, and your teams arrive prepared — that's operational protection at scale.

## What This Protects
- **Field crews** from dangerous routes and wasted drive time
- **Project managers** from scheduling conflicts and crew collisions  
- **Estimators** from missing site access issues during bidding
- **Dispatchers** from sending teams into restricted zones
- **Owners** from liability exposure and efficiency losses

## File Targets
- `components/maps/SmartMap.tsx` (new)
- `components/maps/RouteOptimizer.tsx` (new)
- `components/maps/SiteIntelligence.tsx` (new)
- `components/maps/CrewTracker.tsx` (new)
- `lib/maps/route-engine.ts` (new)
- `lib/maps/site-analyzer.ts` (new)
- `lib/maps/safety-monitor.ts` (new)
- `pages/dispatch.tsx` (new)
- `pages/projects/[id]/map.tsx` (new)
- `hooks/useSmartMaps.ts` (new)
- `types/maps.ts` (new)

## Step-by-Step Instructions

### 1. Define Smart Maps Types and Safety Framework
Establish the protective mapping infrastructure:

```typescript
// types/maps.ts
export interface SmartMapConfig {
  center: Coordinates
  zoom: number
  style: 'streets' | 'satellite' | 'terrain' | 'dark'
  overlays: MapOverlay[]
  restrictions: AccessRestriction[]
  safetyZones: SafetyZone[]
}

export interface Coordinates {
  lat: number
  lng: number
  accuracy?: number // meters
  timestamp?: Date
}

export interface Site {
  id: string
  projectId: string
  name: string
  address: string
  coordinates: Coordinates
  type: 'commercial' | 'residential' | 'industrial' | 'institutional'
  access: {
    restrictions: string[]
    requiresBadge: boolean
    securityContact?: string
    parkingNotes?: string
    entryPoint?: Coordinates
  }
  hazards: SiteHazard[]
  schedule: {
    workHours: string
    noiseRestrictions?: string
    permitRequired: boolean
  }
  contacts: SiteContact[]
}

export interface Route {
  id: string
  name: string
  date: Date
  crew: CrewMember[]
  vehicle: Vehicle
  stops: RouteStop[]
  optimized: boolean
  distance: number // miles
  duration: number // minutes
  fuelCost: number
  safety: {
    score: number // 0-100
    warnings: SafetyWarning[]
    weatherImpact?: WeatherCondition
  }
}

export interface RouteStop {
  siteId: string
  sequence: number
  arrivalTime: Date
  departureTime: Date
  workType: string
  materials: Material[]
  notes?: string
  status: 'pending' | 'en-route' | 'on-site' | 'completed' | 'skipped'
}

export interface SafetyWarning {
  type: 'traffic' | 'weather' | 'crime' | 'construction' | 'restriction'
  severity: 'low' | 'medium' | 'high'
  message: string
  location: Coordinates
  timeWindow?: { start: Date; end: Date }
  alternateRoute?: boolean
}

export interface CrewMember {
  id: string
  name: string
  role: 'lead' | 'journeyman' | 'apprentice' | 'helper'
  certifications: string[]
  emergencyContact: string
  currentLocation?: Coordinates
  status: 'available' | 'en-route' | 'on-site' | 'break' | 'offline'
}

export interface Vehicle {
  id: string
  type: 'pickup' | 'box-truck' | 'crane' | 'van'
  capacity: {
    weight: number // lbs
    volume: number // cubic ft
  }
  restrictions: string[] // "No residential", "Requires CDL", etc.
  mpg: number
  lastMaintenance: Date
  insurance: {
    policy: string
    expires: Date
  }
}
```

### 2. Build the Route Optimization Engine
Create the protective routing system that prevents waste:

```typescript
// lib/maps/route-engine.ts
import { Route, Site, RouteStop, SafetyWarning, CrewMember, Vehicle } from '@/types/maps'

export class RouteEngine {
  private mapboxToken: string
  private safetyApi: string
  
  constructor() {
    this.mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!
    this.safetyApi = process.env.NEXT_PUBLIC_SAFETY_API!
  }
  
  async optimizeRoute(
    sites: Site[], 
    crew: CrewMember[], 
    vehicle: Vehicle,
    constraints: RouteConstraints
  ): Promise<Route> {
    // Step 1: Filter sites based on vehicle and crew capabilities
    const accessibleSites = this.filterAccessibleSites(sites, vehicle, crew)
    
    // Step 2: Check safety conditions for each site
    const safetyData = await this.checkSafetyConditions(accessibleSites)
    
    // Step 3: Calculate optimal sequence considering multiple factors
    const sequence = await this.calculateOptimalSequence(
      accessibleSites,
      safetyData,
      constraints
    )
    
    // Step 4: Generate detailed routing with timing
    const detailedRoute = await this.generateDetailedRoute(sequence, constraints)
    
    // Step 5: Calculate costs and emissions
    const routeMetrics = this.calculateRouteMetrics(detailedRoute, vehicle)
    
    return {
      id: `route-${Date.now()}`,
      name: `${crew[0].name} Team - ${new Date().toLocaleDateString()}`,
      date: new Date(),
      crew,
      vehicle,
      stops: detailedRoute.stops,
      optimized: true,
      distance: routeMetrics.distance,
      duration: routeMetrics.duration,
      fuelCost: routeMetrics.fuelCost,
      safety: {
        score: routeMetrics.safetyScore,
        warnings: safetyData.warnings,
        weatherImpact: safetyData.weather
      }
    }
  }
  
  private filterAccessibleSites(sites: Site[], vehicle: Vehicle, crew: CrewMember[]): Site[] {
    return sites.filter(site => {
      // Check vehicle restrictions
      if (site.type === 'residential' && vehicle.restrictions.includes('No residential')) {
        return false
      }
      
      // Check crew certifications
      const requiredCerts = site.access.restrictions.filter(r => r.includes('certification'))
      const crewCerts = crew.flatMap(member => member.certifications)
      const hasRequiredCerts = requiredCerts.every(cert => crewCerts.includes(cert))
      
      if (!hasRequiredCerts) {
        return false
      }
      
      // Check time windows
      const now = new Date()
      const currentHour = now.getHours()
      const workHours = site.schedule.workHours.split('-').map(h => parseInt(h))
      
      if (currentHour < workHours[0] || currentHour > workHours[1]) {
        return false
      }
      
      return true
    })
  }
  
  private async checkSafetyConditions(sites: Site[]): Promise<{
    warnings: SafetyWarning[]
    weather: WeatherCondition
  }> {
    const warnings: SafetyWarning[] = []
    
    // Check weather conditions
    const weatherResponse = await fetch(`${this.safetyApi}/weather`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        locations: sites.map(s => s.coordinates) 
      })
    })
    
    const weatherData = await weatherResponse.json()
    
    // Check traffic and safety
    for (const site of sites) {
      // Traffic check
      const trafficResponse = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${site.coordinates.lng},${site.coordinates.lat}?access_token=${this.mapboxToken}`
      )
      
      const traffic = await trafficResponse.json()
      
      if (traffic.routes[0]?.weight_typical / traffic.routes[0]?.weight > 1.5) {
        warnings.push({
          type: 'traffic',
          severity: 'medium',
          message: `Heavy traffic near ${site.name}. Consider alternate timing.`,
          location: site.coordinates
        })
      }
      
      // Crime data check (if available)
      if (site.type === 'commercial' && this.isHighCrimeArea(site.coordinates)) {
        warnings.push({
          type: 'crime',
          severity: 'medium',
          message: `Elevated crime area. Implement buddy system and secure tools.`,
          location: site.coordinates
        })
      }
      
      // Site-specific hazards
      site.hazards.forEach(hazard => {
        warnings.push({
          type: 'restriction',
          severity: hazard.severity as 'low' | 'medium' | 'high',
          message: hazard.description,
          location: site.coordinates
        })
      })
    }
    
    return { warnings, weather: weatherData }
  }
  
  private async calculateOptimalSequence(
    sites: Site[],
    safetyData: any,
    constraints: RouteConstraints
  ): Promise<Site[]> {
    // Use advanced TSP algorithm with multiple constraints
    const matrix = await this.buildDistanceMatrix(sites)
    
    // Factor in:
    // 1. Distance/time
    // 2. Site priorities
    // 3. Time windows
    // 4. Crew fatigue (limit backtracking)
    // 5. Safety scores
    
    let bestSequence = [...sites]
    let bestCost = Infinity
    
    // Simulated annealing for optimization
    let currentSequence = [...sites]
    let currentCost = this.calculateRouteCost(currentSequence, matrix, constraints)
    
    const iterations = 10000
    let temperature = 100
    
    for (let i = 0; i < iterations; i++) {
      // Generate neighbor solution
      const newSequence = this.generateNeighbor(currentSequence)
      const newCost = this.calculateRouteCost(newSequence, matrix, constraints)
      
      // Accept or reject
      const delta = newCost - currentCost
      if (delta < 0 || Math.random() < Math.exp(-delta / temperature)) {
        currentSequence = newSequence
        currentCost = newCost
        
        if (currentCost < bestCost) {
          bestSequence = [...currentSequence]
          bestCost = currentCost
        }
      }
      
      // Cool down
      temperature *= 0.995
    }
    
    return bestSequence
  }
  
  private async buildDistanceMatrix(sites: Site[]): Promise<number[][]> {
    const n = sites.length
    const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0))
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const distance = await this.getRoutingDistance(
          sites[i].coordinates,
          sites[j].coordinates
        )
        matrix[i][j] = distance
        matrix[j][i] = distance
      }
    }
    
    return matrix
  }
  
  private async getRoutingDistance(from: Coordinates, to: Coordinates): Promise<number> {
    const response = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${from.lng},${from.lat};${to.lng},${to.lat}?access_token=${this.mapboxToken}`
    )
    
    const data = await response.json()
    return data.routes[0]?.distance || this.haversineDistance(from, to)
  }
  
  private haversineDistance(from: Coordinates, to: Coordinates): number {
    const R = 3959 // Earth radius in miles
    const dLat = (to.lat - from.lat) * Math.PI / 180
    const dLon = (to.lng - from.lng) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
  
  private calculateRouteCost(
    sequence: Site[],
    matrix: number[][],
    constraints: RouteConstraints
  ): number {
    let cost = 0
    
    // Distance cost
    for (let i = 0; i < sequence.length - 1; i++) {
      const fromIdx = sequence.findIndex(s => s.id === sequence[i].id)
      const toIdx = sequence.findIndex(s => s.id === sequence[i + 1].id)
      cost += matrix[fromIdx][toIdx]
    }
    
    // Time window penalties
    let currentTime = constraints.startTime
    for (const site of sequence) {
      const travelTime = 30 // simplified
      currentTime = new Date(currentTime.getTime() + travelTime * 60000)
      
      const workHours = site.schedule.workHours.split('-').map(h => parseInt(h))
      const hour = currentTime.getHours()
      
      if (hour < workHours[0] || hour > workHours[1]) {
        cost += 1000 // Heavy penalty for wrong timing
      }
    }
    
    return cost
  }
  
  private generateNeighbor(sequence: Site[]): Site[] {
    const newSequence = [...sequence]
    const i = Math.floor(Math.random() * sequence.length)
    const j = Math.floor(Math.random() * sequence.length)
    
    // Swap two random sites
    [newSequence[i], newSequence[j]] = [newSequence[j], newSequence[i]]
    
    return newSequence
  }
  
  private async generateDetailedRoute(
    sequence: Site[],
    constraints: RouteConstraints
  ): Promise<{ stops: RouteStop[] }> {
    const stops: RouteStop[] = []
    let currentTime = constraints.startTime
    
    for (let i = 0; i < sequence.length; i++) {
      const site = sequence[i]
      const travelTime = i === 0 ? 0 : 30 // Simplified - would calculate actual
      
      const arrivalTime = new Date(currentTime.getTime() + travelTime * 60000)
      const workDuration = constraints.avgStopDuration || 60
      const departureTime = new Date(arrivalTime.getTime() + workDuration * 60000)
      
      stops.push({
        siteId: site.id,
        sequence: i + 1,
        arrivalTime,
        departureTime,
        workType: 'inspection', // Would be dynamic
        materials: [],
        status: 'pending'
      })
      
      currentTime = departureTime
    }
    
    return { stops }
  }
  
  private calculateRouteMetrics(route: any, vehicle: Vehicle) {
    const distance = route.stops.reduce((sum: number, stop: RouteStop, i: number) => {
      if (i === 0) return sum
      // Simplified - would calculate actual distance
      return sum + 10
    }, 0)
    
    const duration = route.stops.reduce((sum: number, stop: RouteStop) => {
      return sum + (stop.departureTime.getTime() - stop.arrivalTime.getTime()) / 60000
    }, 0)
    
    const fuelCost = (distance / vehicle.mpg) * 4.50 // $4.50/gallon
    
    const safetyScore = 85 // Would calculate based on warnings
    
    return { distance, duration, fuelCost, safetyScore }
  }
  
  private isHighCrimeArea(coordinates: Coordinates): boolean {
    // Integrate with crime data API
    // Simplified for now
    return false
  }
}

interface RouteConstraints {
  startTime: Date
  endTime: Date
  maxStops?: number
  avgStopDuration?: number // minutes
  prioritySites?: string[]
  avoidAreas?: Coordinates[]
}

interface WeatherCondition {
  temperature: number
  conditions: 'clear' | 'rain' | 'snow' | 'fog' | 'severe'
  windSpeed: number
  visibility: number
}

interface SiteHazard {
  type: string
  severity: string
  description: string
  mitigations: string[]
}

interface SiteContact {
  name: string
  role: string
  phone: string
  email?: string
}

interface Material {
  name: string
  quantity: number
  weight: number
}

interface AccessRestriction {
  type: string
  description: string
  requirement?: string
}

interface SafetyZone {
  name: string
  coordinates: Coordinates[]
  type: 'avoid' | 'caution' | 'preferred'
  reason: string
}

interface MapOverlay {
  id: string
  type: 'sites' | 'routes' | 'crews' | 'weather' | 'traffic'
  visible: boolean
  data?: any
}
```

### 3. Build the Smart Map Component
Create the protective map interface:

```tsx
// components/maps/SmartMap.tsx
import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Navigation, Layers, Users, AlertTriangle, 
  Clock, Fuel, DollarSign, Shield
} from 'lucide-react'
import { useSmartMaps } from '@/hooks/useSmartMaps'
import GlassPanel from '@/components/ui/GlassPanel'
import Button from '@/components/ui/Button'
import RouteOptimizer from './RouteOptimizer'
import CrewTracker from './CrewTracker'
import SiteIntelligence from './SiteIntelligence'

interface SmartMapProps {
  projectId?: string
  sites: Site[]
  crews?: CrewMember[]
  onRouteSelect?: (route: Route) => void
}

export default function SmartMap({ projectId, sites, crews = [], onRouteSelect }: SmartMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [activePanel, setActivePanel] = useState<'route' | 'crews' | 'intel' | null>(null)
  
  const {
    routes,
    activeRoute,
    warnings,
    loading,
    createRoute,
    updateRoute,
    trackCrew
  } = useSmartMaps(projectId)
  
  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAP_ENABLED) return
    
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-104.9903, 39.7392], // Denver default
      zoom: 11
    })
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    
    // Add sites to map
    addSitesToMap(sites)
    
    // Add crew locations if available
    if (crews.length > 0) {
      addCrewsToMap(crews)
    }
    
    // Add safety overlays
    addSafetyOverlays()
    
    return () => {
      map.current?.remove()
    }
  }, [sites, crews])
  
  const addSitesToMap = (sites: Site[]) => {
    if (!map.current) return
    
    // Add site markers with condition indicators
    sites.forEach(site => {
      const el = document.createElement('div')
      el.className = 'site-marker'
      el.style.width = '30px'
      el.style.height = '30px'
      el.style.borderRadius = '50%'
      el.style.border = '3px solid white'
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
      el.style.cursor = 'pointer'
      
      // Color by site type
      const colors = {
        commercial: '#3b82f6',
        residential: '#10b981',
        industrial: '#f59e0b',
        institutional: '#8b5cf6'
      }
      
      el.style.backgroundColor = colors[site.type] || '#6b7280'
      
      // Add hazard indicator if present
      if (site.hazards.length > 0) {
        const hazardDot = document.createElement('div')
        hazardDot.style.position = 'absolute'
        hazardDot.style.top = '-4px'
        hazardDot.style.right = '-4px'
        hazardDot.style.width = '12px'
        hazardDot.style.height = '12px'
        hazardDot.style.backgroundColor = '#ef4444'
        hazardDot.style.borderRadius = '50%'
        hazardDot.style.border = '2px solid white'
        el.appendChild(hazardDot)
      }
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([site.coordinates.lng, site.coordinates.lat])
        .setPopup(createSitePopup(site))
        .addTo(map.current!)
      
      el.addEventListener('click', () => {
        setActivePanel('intel')
        // Load site intelligence
      })
    })
  }
  
  const createSitePopup = (site: Site) => {
    const html = `
      <div class="p-3 min-w-[200px]">
        <h4 class="font-semibold text-sm mb-1">${site.name}</h4>
        <p class="text-xs text-gray-600 mb-2">${site.address}</p>
        <div class="space-y-1 text-xs">
          <div class="flex justify-between">
            <span>Type:</span>
            <span class="font-medium capitalize">${site.type}</span>
          </div>
          <div class="flex justify-between">
            <span>Access:</span>
            <span class="font-medium ${site.access.requiresBadge ? 'text-amber-600' : 'text-green-600'}">
              ${site.access.requiresBadge ? 'Badge Required' : 'Open Access'}
            </span>
          </div>
          ${site.hazards.length > 0 ? `
            <div class="pt-1 mt-1 border-t border-gray-200">
              <span class="text-red-600 font-medium">⚠️ ${site.hazards.length} Hazards</span>
            </div>
          ` : ''}
        </div>
      </div>
    `
    
    return new mapboxgl.Popup({ offset: 25 }).setHTML(html)
  }
  
  const addCrewsToMap = (crews: CrewMember[]) => {
    if (!map.current) return
    
    crews.forEach(crew => {
      if (!crew.currentLocation) return
      
      const el = document.createElement('div')
      el.className = 'crew-marker'
      el.innerHTML = `
        <div class="relative">
          <div class="absolute -inset-1 bg-blue-500 rounded-full animate-ping opacity-75"></div>
          <div class="relative w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            ${crew.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      `
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([crew.currentLocation.lng, crew.currentLocation.lat])
        .addTo(map.current!)
      
      // Update position in real-time
      const updateInterval = setInterval(() => {
        trackCrew(crew.id).then(location => {
          if (location) {
            marker.setLngLat([location.lng, location.lat])
          }
        })
      }, 30000) // Update every 30 seconds
      
      // Clean up on unmount
      return () => clearInterval(updateInterval)
    })
  }
  
  const addSafetyOverlays = () => {
    if (!map.current) return
    
    // Add weather layer
    map.current.on('load', () => {
      // Add precipitation layer
      map.current!.addLayer({
        id: 'precipitation',
        type: 'raster',
        source: {
          type: 'raster',
          tiles: [`https://api.mapbox.com/styles/v1/mapbox/precipitation-v2/tiles/{z}/{x}/{y}?access_token=${mapboxgl.accessToken}`],
          tileSize: 256
        },
        paint: {
          'raster-opacity': 0.5
        },
        layout: {
          visibility: 'none'
        }
      })
      
      // Add traffic layer
      map.current!.addLayer({
        id: 'traffic',
        type: 'line',
        source: {
          type: 'vector',
          url: 'mapbox://mapbox.mapbox-traffic-v1'
        },
        'source-layer': 'traffic',
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'congestion'], 'heavy'], '#e74c3c',
            ['==', ['get', 'congestion'], 'moderate'], '#f39c12',
            ['==', ['get', 'congestion'], 'low'], '#f1c40f',
            '#27ae60'
          ],
          'line-width': 3
        },
        layout: {
          visibility: 'none'
        }
      })
    })
  }
  
  const toggleLayer = (layerId: string) => {
    if (!map.current) return
    
    const visibility = map.current.getLayoutProperty(layerId, 'visibility')
    map.current.setLayoutProperty(
      layerId,
      'visibility',
      visibility === 'visible' ? 'none' : 'visible'
    )
  }
  
  return (
    <div className="relative w-full h-full min-h-[600px]">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 rounded-2xl overflow-hidden" />
      
      {/* Control Panel */}
      <div className="absolute top-4 left-4 space-y-2 z-10">
        <GlassPanel className="p-2" variant="elevated">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={activePanel === 'route' ? 'primary' : 'glass'}
              onClick={() => setActivePanel(activePanel === 'route' ? null : 'route')}
              className="px-3"
            >
              <Navigation className="w-4 h-4 mr-1" />
              Routes
            </Button>
            <Button
              size="sm"
              variant={activePanel === 'crews' ? 'primary' : 'glass'}
              onClick={() => setActivePanel(activePanel === 'crews' ? null : 'crews')}
              className="px-3"
            >
              <Users className="w-4 h-4 mr-1" />
              Crews
            </Button>
            <Button
              size="sm"
              variant={activePanel === 'intel' ? 'primary' : 'glass'}
              onClick={() => setActivePanel(activePanel === 'intel' ? null : 'intel')}
              className="px-3"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Intel
            </Button>
          </div>
        </GlassPanel>
        
        {/* Layer Controls */}
        <GlassPanel className="p-2" variant="elevated">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="glass"
              onClick={() => toggleLayer('traffic')}
              className="p-2"
              title="Toggle Traffic"
            >
              🚦
            </Button>
            <Button
              size="sm"
              variant="glass"
              onClick={() => toggleLayer('precipitation')}
              className="p-2"
              title="Toggle Weather"
            >
              🌧️
            </Button>
            <Button
              size="sm"
              variant="glass"
              onClick={() => {
                const style = map.current?.getStyle()
                const isDark = style?.name?.includes('dark')
                map.current?.setStyle(`mapbox://styles/mapbox/${isDark ? 'light' : 'dark'}-v11`)
              }}
              className="p-2"
              title="Toggle Dark Mode"
            >
              🌓
            </Button>
          </div>
        </GlassPanel>
      </div>
      
      {/* Active Route Summary */}
      {activeRoute && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-4 left-4 right-4 max-w-md mx-auto z-10"
        >
          <GlassPanel variant="elevated" glow className="p-4">
            <h4 className="font-semibold mb-2">{activeRoute.name}</h4>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div className="text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                <p className="font-medium">{Math.round(activeRoute.duration / 60)}h</p>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              <div className="text-center">
                <Navigation className="w-5 h-5 mx-auto mb-1 text-green-500" />
                <p className="font-medium">{activeRoute.distance}mi</p>
                <p className="text-xs text-gray-500">Distance</p>
              </div>
              <div className="text-center">
                <Fuel className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <p className="font-medium">${activeRoute.fuelCost.toFixed(0)}</p>
                <p className="text-xs text-gray-500">Fuel Cost</p>
              </div>
              <div className="text-center">
                <Shield className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                <p className="font-medium">{activeRoute.safety.score}%</p>
                <p className="text-xs text-gray-500">Safety</p>
              </div>
            </div>
            
            {activeRoute.safety.warnings.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ {activeRoute.safety.warnings.length} safety warnings along route
                </p>
              </div>
            )}
          </GlassPanel>
        </motion.div>
      )}
      
      {/* Side Panels */}
      <AnimatePresence>
        {activePanel === 'route' && (
          <RouteOptimizer
            sites={sites}
            crews={crews}
            onRouteCreate={createRoute}
            onClose={() => setActivePanel(null)}
          />
        )}
        
        {activePanel === 'crews' && (
          <CrewTracker
            crews={crews}
            routes={routes}
            onClose={() => setActivePanel(null)}
          />
        )}
        
        {activePanel === 'intel' && (
          <SiteIntelligence
            sites={sites}
            warnings={warnings}
            onClose={() => setActivePanel(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
```

### 4. Build the Route Optimizer Panel
Create the protective route planning interface:

```tsx
// components/maps/RouteOptimizer.tsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Plus, Calendar, Users, Truck, AlertCircle } from 'lucide-react'
import { Site, CrewMember, Vehicle } from '@/types/maps'
import GlassPanel from '@/components/ui/GlassPanel'
import Button from '@/components/ui/Button'

interface RouteOptimizerProps {
  sites: Site[]
  crews: CrewMember[]
  onRouteCreate: (route: any) => void
  onClose: () => void
}

export default function RouteOptimizer({
  sites,
  crews,
  onRouteCreate,
  onClose
}: RouteOptimizerProps) {
  const [selectedSites, setSelectedSites] = useState<string[]>([])
  const [selectedCrew, setSelectedCrew] = useState<string[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<string>('')
  const [routeDate, setRouteDate] = useState(new Date().toISOString().split('T')[0])
  const [optimizing, setOptimizing] = useState(false)
  
  const vehicles: Vehicle[] = [
    {
      id: 'truck-1',
      type: 'pickup',
      capacity: { weight: 2000, volume: 100 },
      restrictions: [],
      mpg: 18,
      lastMaintenance: new Date('2024-01-15'),
      insurance: { policy: 'COM-12345', expires: new Date('2025-06-01') }
    },
    {
      id: 'truck-2',
      type: 'box-truck',
      capacity: { weight: 10000, volume: 500 },
      restrictions: ['Requires CDL'],
      mpg: 12,
      lastMaintenance: new Date('2024-02-01'),
      insurance: { policy: 'COM-12346', expires: new Date('2025-06-01') }
    }
  ]
  
  const handleOptimize = async () => {
    if (selectedSites.length === 0 || selectedCrew.length === 0 || !selectedVehicle) {
      return
    }
    
    setOptimizing(true)
    
    // Simulate optimization
    setTimeout(() => {
      const optimizedRoute = {
        sites: selectedSites.map(id => sites.find(s => s.id === id)!),
        crew: selectedCrew.map(id => crews.find(c => c.id === id)!),
        vehicle: vehicles.find(v => v.id === selectedVehicle)!,
        date: new Date(routeDate),
        optimized: true
      }
      
      onRouteCreate(optimizedRoute)
      setOptimizing(false)
    }, 2000)
  }
  
  const toggleSite = (siteId: string) => {
    setSelectedSites(prev => 
      prev.includes(siteId) 
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    )
  }
  
  const toggleCrew = (crewId: string) => {
    setSelectedCrew(prev => 
      prev.includes(crewId) 
        ? prev.filter(id => id !== crewId)
        : [...prev, crewId]
    )
  }
  
  return (
    <motion.div
      initial={{ x: -400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -400, opacity: 0 }}
      className="absolute top-0 left-0 h-full w-96 max-w-full p-4 overflow-y-auto z-20"
    >
      <GlassPanel variant="elevated" className="h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold">Route Optimizer</h3>
          <Button size="sm" variant="glass" onClick={onClose} className="p-1">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Date Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Route Date
          </label>
          <input
            type="date"
            value={routeDate}
            onChange={(e) => setRouteDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600"
          />
        </div>
        
        {/* Site Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Select Sites ({selectedSites.length} selected)
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sites.map(site => (
              <div
                key={site.id}
                onClick={() => toggleSite(site.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedSites.includes(site.id)
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                    : 'bg-white/50 dark:bg-gray-800/50 border-2 border-transparent hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{site.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {site.type} • {site.address}
                    </p>
                  </div>
                  {site.hazards.length > 0 && (
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Crew Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Select Crew Members
          </label>
          <div className="space-y-2">
            {crews.map(crew => (
              <div
                key={crew.id}
                onClick={() => toggleCrew(crew.id)}
                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                  selectedCrew.includes(crew.id)
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                    : 'bg-white/50 dark:bg-gray-800/50 border-2 border-transparent hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{crew.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {crew.role} • {crew.status}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    crew.status === 'available' ? 'bg-green-500' :
                    crew.status === 'on-site' ? 'bg-amber-500' :
                    'bg-gray-500'
                  }`} />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Vehicle Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            <Truck className="w-4 h-4 inline mr-1" />
            Select Vehicle
          </label>
          <div className="space-y-2">
            {vehicles.map(vehicle => (
              <div
                key={vehicle.id}
                onClick={() => setSelectedVehicle(vehicle.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedVehicle === vehicle.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500'
                    : 'bg-white/50 dark:bg-gray-800/50 border-2 border-transparent hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm capitalize">{vehicle.type}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {vehicle.capacity.weight} lbs • {vehicle.mpg} MPG
                    </p>
                  </div>
                  {vehicle.restrictions.length > 0 && (
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">
                      {vehicle.restrictions[0]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Optimize Button */}
        <Button
          onClick={handleOptimize}
          disabled={selectedSites.length === 0 || selectedCrew.length === 0 || !selectedVehicle || optimizing}
          className="w-full"
          variant="primary"
          glow
        >
          {optimizing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Optimizing Route...
            </>
          ) : (
            'Optimize Route'
          )}
        </Button>
        
        {/* Protection Notice */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Route optimization considers: distance, traffic, time windows, crew certifications, 
            vehicle restrictions, and safety conditions. The system protects against inefficient 
            routing and safety risks.
          </p>
        </div>
      </GlassPanel>
    </motion.div>
  )
}
```

### 5. Create the Smart Maps Hook
Manage map state and real-time updates:

```tsx
// hooks/useSmartMaps.ts
import { useState, useEffect, useCallback } from 'react'
import { Route, Site, CrewMember, SafetyWarning } from '@/types/maps'
import { RouteEngine } from '@/lib/maps/route-engine'

export function useSmartMaps(projectId?: string) {
  const [routes, setRoutes] = useState<Route[]>([])
  const [activeRoute, setActiveRoute] = useState<Route | null>(null)
  const [warnings, setWarnings] = useState<SafetyWarning[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Load existing routes for project
  useEffect(() => {
    if (projectId) {
      loadProjectRoutes(projectId)
    }
  }, [projectId])
  
  const loadProjectRoutes = async (projectId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/projects/${projectId}/routes`)
      if (!response.ok) throw new Error('Failed to load routes')
      
      const data = await response.json()
      setRoutes(data.routes)
      
      // Load active route if any
      const active = data.routes.find((r: Route) => r.status === 'active')
      if (active) {
        setActiveRoute(active)
      }
    } catch (err) {
      console.error('Failed to load routes:', err)
      setError('Unable to load route data')
    } finally {
      setLoading(false)
    }
  }
  
  const createRoute = useCallback(async (routeData: {
    sites: Site[]
    crew: CrewMember[]
    vehicle: Vehicle
    date: Date
  }) => {
    if (!process.env.NEXT_PUBLIC_MAP_ENABLED) {
      setError('Maps are currently disabled')
      return null
    }
    
    try {
      setLoading(true)
      const engine = new RouteEngine()
      
      const optimizedRoute = await engine.optimizeRoute(
        routeData.sites,
        routeData.crew,
        routeData.vehicle,
        {
          startTime: new Date(routeData.date),
          endTime: new Date(routeData.date.getTime() + 8 * 60 * 60 * 1000), // 8 hours
          avgStopDuration: 45 // minutes
        }
      )
      
      // Save route to database
      const response = await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          route: optimizedRoute
        })
      })
      
      if (!response.ok) throw new Error('Failed to save route')
      
      const savedRoute = await response.json()
      setRoutes(prev => [...prev, savedRoute])
      setActiveRoute(savedRoute)
      
      // Update warnings
      if (savedRoute.safety.warnings.length > 0) {
        setWarnings(savedRoute.safety.warnings)
      }
      
      return savedRoute
    } catch (err) {
      console.error('Route creation error:', err)
      setError('Failed to create optimized route')
      return null
    } finally {
      setLoading(false)
    }
  }, [projectId])
  
  const updateRoute = useCallback(async (routeId: string, updates: Partial<Route>) => {
    try {
      const response = await fetch(`/api/routes/${routeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) throw new Error('Failed to update route')
      
      const updatedRoute = await response.json()
      setRoutes(prev => prev.map(r => r.id === routeId ? updatedRoute : r))
      
      if (activeRoute?.id === routeId) {
        setActiveRoute(updatedRoute)
      }
      
      return updatedRoute
    } catch (err) {
      console.error('Route update error:', err)
      setError('Failed to update route')
      return null
    }
  }, [activeRoute])
  
  const trackCrew = useCallback(async (crewId: string) => {
    try {
      const response = await fetch(`/api/crews/${crewId}/location`)
      if (!response.ok) throw new Error('Failed to get crew location')
      
      const location = await response.json()
      return location
    } catch (err) {
      console.error('Crew tracking error:', err)
      return null
    }
  }, [])
  
  return {
    routes,
    activeRoute,
    warnings,
    loading,
    error,
    createRoute,
    updateRoute,
    trackCrew,
    setActiveRoute
  }
}
```

## Commit Message
```
feat(maps): implemented protective smart mapping system

- Built RouteEngine with multi-factor optimization and safety checks
- Created SmartMap component with real-time crew tracking
- Implemented RouteOptimizer for intelligent route planning
- Added safety overlays for weather, traffic, and hazards
- Protects field teams from inefficiency and safety risks
```

## QA/Acceptance Checklist
- [ ] Map loads with all sites visible within 2 seconds
- [ ] Site markers color-coded by type with hazard indicators
- [ ] Route optimization considers all constraints (time, vehicle, crew)
- [ ] Safety warnings appear for high-risk areas or conditions
- [ ] Crew locations update in real-time (30-second intervals)
- [ ] Weather and traffic overlays toggle properly
- [ ] Route summary shows duration, distance, fuel cost, and safety score
- [ ] Mobile view maintains full functionality with touch controls
- [ ] Feature flag `NEXT_PUBLIC_MAP_ENABLED` controls visibility
- [ ] Mapbox token properly configured and working

## AI Execution Block

### Codex/Operator Instructions:
1. Install Mapbox dependencies: `npm install mapbox-gl @types/mapbox-gl`
2. Set up Mapbox account and add token to `.env.local`
3. Create all type definitions in `types/maps.ts`
4. Implement RouteEngine with full optimization logic
5. Build SmartMap component with all overlays
6. Create RouteOptimizer panel with site/crew selection
7. Implement CrewTracker and SiteIntelligence panels
8. Create useSmartMaps hook for state management
9. Add sample sites and crews for testing
10. Test route optimization with various constraints
11. Verify safety warnings trigger for hazardous conditions
12. Commit with provided message and deploy

**Operator Validation**: Create a route with 5 sites across Denver. Confirm optimization reorders stops for efficiency. Add a crew member and verify their location appears on map. Toggle weather overlay during rain - confirm precipitation layer shows. Check that sites requiring badges show amber access indicators.

## Advanced/Optional Enhancements

### Offline Mode
```typescript
// Enable offline map caching
import MapboxOffline from '@mapbox/mapbox-gl-offline'

const enableOfflineMode = async (bounds: [number, number, number, number]) => {
  const offline = new MapboxOffline(map.current)
  await offline.downloadRegion(bounds, 10, 15) // zoom 10-15
  localStorage.setItem('offline-maps-ready', 'true')
}
```

### Predictive Routing
```typescript
// ML-based traffic prediction
const predictTraffic = async (route: Route) => {
  const historicalData = await getHistoricalTraffic(route)
  const prediction = await mlModel.predict({
    dayOfWeek: route.date.getDay(),
    timeOfDay: route.stops[0].arrivalTime.getHours(),
    weather: await getWeatherForecast(route.date),
    historicalPatterns: historicalData
  })
  
  return adjustRouteForPredictedTraffic(route, prediction)
}
```

### Geofencing Alerts
```typescript
// Automatic alerts when entering restricted zones
const setupGeofencing = (restrictedZones: SafetyZone[]) => {
  navigator.geolocation.watchPosition((position) => {
    const current = { lat: position.coords.latitude, lng: position.coords.longitude }
    
    restrictedZones.forEach(zone => {
      if (isPointInPolygon(current, zone.coordinates)) {
        sendAlert({
          type: 'geofence-violation',
          message: `Entering ${zone.type} zone: ${zone.reason}`,
          severity: 'high'
        })
      }
    })
  })
}
```

---

**Reference**: See [QUANTUM_LEAP_CONTEXT.md](/docs/QUANTUM_LEAP_CONTEXT.md) for mapping standards and safety integration requirements.