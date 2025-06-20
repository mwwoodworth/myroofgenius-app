'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function useRouteChanged(callback: () => void) {
  const pathname = usePathname()
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    savedCallback.current()
  }, [pathname])
}
