import { useCallback } from 'react'

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

const hapticPatterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 50,
  heavy: 100,
  success: [50, 50, 50],
  warning: [100, 50, 100],
  error: [200, 100, 200],
}

export function useHapticFeedback() {
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator

  const trigger = useCallback((pattern: HapticPattern) => {
    if (!isSupported) return

    const vibrationPattern = hapticPatterns[pattern]
    
    try {
      navigator.vibrate(vibrationPattern)
    } catch (error) {
      console.warn('Haptic feedback not supported:', error)
    }
  }, [isSupported])

  const triggerCustom = useCallback((pattern: number | number[]) => {
    if (!isSupported) return

    try {
      navigator.vibrate(pattern)
    } catch (error) {
      console.warn('Haptic feedback not supported:', error)
    }
  }, [isSupported])

  return {
    trigger,
    triggerCustom,
    isSupported,
  }
}