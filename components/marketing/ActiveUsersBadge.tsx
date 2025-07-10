'use client'
import { usePresence } from '../ui/PresenceProvider'

export default function ActiveUsersBadge() {
  const users = usePresence()
  if (users.length === 0) return null
  return (
    <span className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
      {users.length} users online
    </span>
  )
}
