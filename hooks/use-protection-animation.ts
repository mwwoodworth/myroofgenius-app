import { useEffect, useState } from 'react'

export function useProtectionAnimation(isProtected: boolean) {
  const [showShield, setShowShield] = useState(false)

  useEffect(() => {
    if (isProtected) {
      setShowShield(true)
      const timer = setTimeout(() => setShowShield(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [isProtected])

  return showShield
}
