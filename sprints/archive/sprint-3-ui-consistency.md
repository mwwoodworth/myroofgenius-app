# Sprint 3: UI Consistency & Role Management

## Why This Matters

Your executive users can't access their AI quick actions. Your theme system fights itself on every page load. These aren't just bugs — they're trust fractures that make your system feel unreliable under pressure. When a project manager switches from dark to light mode and sees both fighting for control, they question what else might be broken.

## What This Protects

- Prevents executive users from losing critical AI functionality
- Eliminates the jarring theme flash that undermines professional confidence
- Ensures consistent role-based experiences across all touchpoints
- Protects keyboard-only users from navigation dead ends

## Sprint Objectives

### 🔴 Critical Fix 1: Executive Role Quick Actions

**Current Issue**: Role context uses 'exec' but UI expects 'executive', breaking the decision layer for an entire user class

**If you're a project manager** wondering why executives on your team can't access their specialized AI prompts, this is why.

**Implementation**:
```typescript
// components/CopilotPanel.tsx - Align role keys
const quickActions: Record<UserRole, QuickAction[]> = {
  pm: [
    { label: 'Analyze Schedule', prompt: 'What are the critical path items?' },
    { label: 'Resource Check', prompt: 'Show resource allocation conflicts' },
  ],
  exec: [ // Changed from 'executive' to 'exec'
    { label: 'Budget Status', prompt: 'Summarize budget vs actuals' },
    { label: 'Risk Assessment', prompt: 'What are top 3 project risks?' },
  ],
  field: [
    { label: 'Safety Check', prompt: 'Review today\'s safety requirements' },
    { label: 'Material Status', prompt: 'Check material delivery status' },
  ],
}
```

**Verification Steps**:
- [ ] Test each role receives correct quick actions
- [ ] Verify role persistence across sessions
- [ ] Confirm UI updates immediately on role switch
- [ ] Document role key convention for future developers

### 🔴 Critical Fix 2: Theme System Collision

**Current Issue**: HTML starts with 'dark' class, theme toggle adds 'light' without removing 'dark', creating visual conflicts

**If you're an architect** working late and switching to light mode for drawings, this instability erodes trust in the tool's precision.

**Field-Ready Implementation**:
```typescript
// app/providers/ThemeProvider.tsx - Clean theme switching
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  
  useEffect(() => {
    // Read saved preference or system preference
    const saved = localStorage.getItem('theme') as Theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = saved || (prefersDark ? 'dark' : 'light')
    
    setTheme(initial)
    updateThemeClass(initial)
  }, [])
  
  const updateThemeClass = (newTheme: Theme) => {
    const html = document.documentElement
    html.classList.remove('dark', 'light')
    html.classList.add(newTheme)
  }
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    updateThemeClass(newTheme)
    localStorage.setItem('theme', newTheme)
  }
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

**Server-Side Theme Initialization**:
```typescript
// app/layout.tsx - Honor user preference on first render
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              const theme = localStorage.getItem('theme') || 
                (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
              document.documentElement.classList.add(theme);
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### ⚠️ Enhancement: Keyboard Navigation Support

**Current Issue**: Modal and carousel lack keyboard controls expected by power users

**Implementation Checklist**:
```typescript
// components/admin/AddProductModal.tsx - Add keyboard handling
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose()
    }
  }
  
  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [isOpen, onClose])

// Add backdrop click handler
<div 
  className="fixed inset-0 bg-black/50"
  onClick={onClose}
  aria-hidden="true"
/>

// components/CopilotPanel.tsx - Add Enter to send
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}
```

## Sprint Deliverables Checklist

### Code Updates
- [ ] Fix executive role key mismatch
- [ ] Implement clean theme switching logic
- [ ] Add theme persistence without flash
- [ ] Add Escape key handling to modals
- [ ] Add Enter key support in Copilot chat
- [ ] Update aria labels for screen readers

### Testing Protocol
- [ ] Manual test: Each role → Correct AI actions
- [ ] Manual test: Theme switch → No dual classes
- [ ] Manual test: Refresh → Theme persists without flash
- [ ] Keyboard test: Tab through entire UI flow
- [ ] Screen reader test: Critical paths narrate correctly

### Documentation
- [ ] Document role key convention (pm/exec/field)
- [ ] Create accessibility testing checklist
- [ ] Update component guidelines with a11y requirements

## What to Watch For

**During Testing**:
- Theme preference not persisting in incognito mode (expected)
- Role changes requiring re-login (current limitation)
- Focus trap needed in modals for full accessibility

**Post-Deployment**:
- Monitor for hydration warnings in browser console
- Check theme performance on slower connections
- Verify role-based features work for all user types

## Audit Loop Integration

Add these checks to your deployment verification:
1. Create test users for each role (pm/exec/field)
2. Verify quick actions appear correctly
3. Toggle theme and refresh — no flash
4. Navigate entire admin flow with keyboard only

## Next Sprint Preview

Sprint 4 completes the payment flow — fixing the broken order status updates and implementing confirmation emails that close the trust loop with your users.

---

**Sprint Duration**: 2 days  
**Risk Level**: High (Breaks executive functionality, undermines UI trust)  
**Dependencies**: Can run parallel to Sprint 2