'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Settings, 
  Moon, 
  Sun, 
  Contrast, 
  Volume2, 
  VolumeX,
  Smartphone,
  Eye,
  Keyboard,
  MousePointer,
  Zap
} from 'lucide-react'
import { Button } from '@/design-system/components/Button'
import { Card } from '@/design-system/components/Card'
import { useHapticFeedback } from '@/design-system/components/hooks/useHapticFeedback'

interface AccessibilitySettings {
  theme: 'light' | 'dark' | 'high-contrast'
  reducedMotion: boolean
  hapticFeedback: boolean
  soundEffects: boolean
  fontSize: 'small' | 'medium' | 'large'
  focusIndicators: boolean
  keyboardNavigation: boolean
  screenReader: boolean
}

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<AccessibilitySettings>({
    theme: 'dark',
    reducedMotion: false,
    hapticFeedback: true,
    soundEffects: true,
    fontSize: 'medium',
    focusIndicators: true,
    keyboardNavigation: true,
    screenReader: false,
  })

  const { trigger, isSupported } = useHapticFeedback()

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings))
    applySettings(settings)
  }, [settings])

  const applySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement

    // Apply theme
    root.removeAttribute('data-theme')
    root.classList.remove('high-contrast')
    
    if (settings.theme === 'light') {
      root.setAttribute('data-theme', 'light')
    } else if (settings.theme === 'high-contrast') {
      root.classList.add('high-contrast')
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large')
    root.classList.add(`font-${settings.fontSize}`)

    // Apply focus indicators
    if (settings.focusIndicators) {
      root.classList.add('enhanced-focus')
    } else {
      root.classList.remove('enhanced-focus')
    }
  }

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    if (settings.hapticFeedback) {
      trigger('light')
    }
  }

  const resetSettings = () => {
    setSettings({
      theme: 'dark',
      reducedMotion: false,
      hapticFeedback: true,
      soundEffects: true,
      fontSize: 'medium',
      focusIndicators: true,
      keyboardNavigation: true,
      screenReader: false,
    })
    trigger('success')
  }

  const getThemeIcon = () => {
    switch (settings.theme) {
      case 'light':
        return <Sun className="w-5 h-5" />
      case 'high-contrast':
        return <Contrast className="w-5 h-5" />
      default:
        return <Moon className="w-5 h-5" />
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-40 p-3 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg safe-area-inset-bottom tap-target"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open accessibility settings"
      >
        <Settings className="w-6 h-6" />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card variant="glass">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Accessibility Settings
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close accessibility settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Theme Settings */}
                  <div>
                    <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                      {getThemeIcon()}
                      Display Theme
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'dark', label: 'Dark', icon: Moon },
                        { value: 'light', label: 'Light', icon: Sun },
                        { value: 'high-contrast', label: 'High Contrast', icon: Contrast },
                      ].map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => updateSetting('theme', value as any)}
                          className={`p-2 rounded-lg border transition-colors flex flex-col items-center gap-1 ${
                            settings.theme === value
                              ? 'border-primary bg-primary/20 text-primary'
                              : 'border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-xs">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Motion Settings */}
                  <div>
                    <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Motion & Effects
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Reduced Motion</span>
                        <input
                          type="checkbox"
                          checked={settings.reducedMotion}
                          onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                          className="w-4 h-4 text-primary bg-gray-800 border-gray-700 rounded focus:ring-primary"
                        />
                      </label>
                      
                      {isSupported && (
                        <label className="flex items-center justify-between">
                          <span className="text-gray-300">Haptic Feedback</span>
                          <input
                            type="checkbox"
                            checked={settings.hapticFeedback}
                            onChange={(e) => updateSetting('hapticFeedback', e.target.checked)}
                            className="w-4 h-4 text-primary bg-gray-800 border-gray-700 rounded focus:ring-primary"
                          />
                        </label>
                      )}
                      
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Sound Effects</span>
                        <input
                          type="checkbox"
                          checked={settings.soundEffects}
                          onChange={(e) => updateSetting('soundEffects', e.target.checked)}
                          className="w-4 h-4 text-primary bg-gray-800 border-gray-700 rounded focus:ring-primary"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Font Size
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'small', label: 'Small' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'large', label: 'Large' },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => updateSetting('fontSize', value as any)}
                          className={`p-2 rounded-lg border transition-colors ${
                            settings.fontSize === value
                              ? 'border-primary bg-primary/20 text-primary'
                              : 'border-gray-700 text-gray-400 hover:border-gray-600'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Settings */}
                  <div>
                    <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                      <Keyboard className="w-5 h-5" />
                      Navigation
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Enhanced Focus Indicators</span>
                        <input
                          type="checkbox"
                          checked={settings.focusIndicators}
                          onChange={(e) => updateSetting('focusIndicators', e.target.checked)}
                          className="w-4 h-4 text-primary bg-gray-800 border-gray-700 rounded focus:ring-primary"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-gray-300">Keyboard Navigation</span>
                        <input
                          type="checkbox"
                          checked={settings.keyboardNavigation}
                          onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                          className="w-4 h-4 text-primary bg-gray-800 border-gray-700 rounded focus:ring-primary"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-700">
                    <Button
                      variant="ghost"
                      onClick={resetSettings}
                      className="flex-1"
                    >
                      Reset to Default
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setIsOpen(false)}
                      className="flex-1"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}