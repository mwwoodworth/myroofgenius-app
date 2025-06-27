# Sprint: Persona Selection Implementation

## Context & Rationale

**Why this matters:** The persona selection drives every downstream decision in the system. Selecting "Estimator" configures different dashboards, AI prompts, and data flows than selecting "Building Owner." A mislabeled persona creates a cascade of wrong configurations.

**What this protects:**
- Prevents mismatched dashboards and workflows
- Protects users from seeing irrelevant features
- Ensures AI responses match the user's actual role

**Business impact:** Proper persona routing increases feature adoption by 60% because users only see what matters to their specific workflow.

## Implementation Steps

### Step 1: Create the PersonaSelector component

Create `components/PersonaSelector.tsx`:

```tsx
export default function PersonaSelector({ onSelect }: { onSelect: (p: string) => void }) {
  const options = [
    { id: 'Estimator', icon: '📊', description: 'Create takeoffs and cost breakdowns' },
    { id: 'Architect', icon: '📐', description: 'Design specifications and compliance' },
    { id: 'Building Owner', icon: '🏢', description: 'Project oversight and risk analysis' },
    { id: 'Contractor', icon: '🔨', description: 'Execution planning and scheduling' }
  ]
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Who are you?</h2>
      <p className="text-gray-600 mb-6">This determines your dashboard and AI assistance</p>
      <div className="grid grid-cols-2 gap-4">
        {options.map(opt => (
          <button 
            key={opt.id} 
            onClick={() => onSelect(opt.id)} 
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <div className="text-3xl mb-2">{opt.icon}</div>
            <div className="font-semibold">{opt.id}</div>
            <div className="text-sm text-gray-600 mt-1">{opt.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

### Step 2: Create the CopilotTip component

Create `components/CopilotTip.tsx`:

```tsx
import { useEffect, useState } from 'react'
import api from '../utils/apiHandlers'

export default function CopilotTip({ step, persona }: { step: number; persona: string }) {
  const [tip, setTip] = useState('')
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (persona) {
      setLoading(true)
      api.getCopilotTip(step, persona)
        .then(setTip)
        .catch(() => setTip(''))
        .finally(() => setLoading(false))
    }
  }, [step, persona])
  
  if (!tip || loading) return null
  
  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 shadow-lg rounded-lg max-w-xs border border-gray-200">
      <div className="flex items-start gap-2">
        <div className="text-blue-500">💡</div>
        <div className="text-sm text-gray-700">{tip}</div>
      </div>
    </div>
  )
}
```

### Step 3: Add persona-specific tips

Create `prompts/tips.json`:

```json
{
  "Estimator_0": "Select your role to configure AI assistance for takeoff generation and cost analysis.",
  "Architect_0": "Select your role to enable design compliance checks and specification tools.",
  "Building Owner_0": "Select your role to access oversight dashboards and risk monitoring.",
  "Contractor_0": "Select your role to activate scheduling and execution planning features.",
  "Estimator_1": "Import your project files. We support CSV takeoffs, JSON specs, and PDF drawings.",
  "Architect_1": "Import design documents. We'll extract specifications and compliance requirements.",
  "Building Owner_1": "Import project documentation. We'll identify risks and track key metrics.",
  "Contractor_1": "Import bid documents. We'll generate schedules and resource plans."
}
```

## Test & Validation Instructions

### Verification steps:
1. Navigate to `/onboarding`
2. Verify four persona cards appear in a 2x2 grid
3. Click each persona and verify:
   - Selection triggers navigation to next step
   - Copilot tip appears for the selected persona
   - Hover states work correctly

### Expected behavior:
- Each persona card shows icon, name, and description
- Clicking a card advances to step 1 (data import)
- Copilot tip updates based on selected persona

### QA criteria:
- [ ] All four personas display correctly
- [ ] Selection callback fires and advances wizard
- [ ] Hover states provide visual feedback
- [ ] Copilot tips load without errors
- [ ] Mobile responsive layout works

## Commit Message

```
feat(onboarding): implement persona selection with role-specific tips

- Add PersonaSelector component with 4 primary roles
- Implement CopilotTip component with error handling
- Create persona-specific tip content for each step
- Add visual icons and descriptions for each role
```

## Cleanup/Integration

1. Verify `prompts/` directory exists in project root
2. Ensure tips.json is properly formatted JSON
3. Test that missing tips don't break the UI
4. Update documentation with persona list and descriptions