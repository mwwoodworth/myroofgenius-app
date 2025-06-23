'use client'

import { CommandDialog, CommandInput, CommandItem, CommandList } from 'cmdk'
import { useRouter } from 'next/navigation'

interface Action {
  label: string
  href: string
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const actions: Action[] = [
  { label: 'Create estimate', href: '/dashboard/estimates/new' },
  { label: 'Open dashboard', href: '/dashboard' },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()

  const handleSelect = (href: string) => {
    router.push(href)
    onOpenChange(false)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} label="Global Command Palette">
      <CommandInput placeholder="Type a command..." />
      <CommandList>
        {actions.map((action) => (
          <CommandItem key={action.href} onSelect={() => handleSelect(action.href)}>
            {action.label}
          </CommandItem>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
