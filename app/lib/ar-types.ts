export interface DroneScan {
  id?: string
  userId?: string
  modelUrl: string
  location?: [number, number]
  createdAt?: string
  metadata?: Record<string, any>
}

export interface ARModel {
  id?: string
  userId?: string
  modelUrl: string
  createdAt?: string
  droneData?: DroneScan
}
