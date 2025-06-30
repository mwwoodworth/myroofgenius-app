# Sprint: Onboarding Wizard Core Implementation

## Context & Rationale

**Why this matters:** The onboarding wizard is the first system interaction for estimators, architects, building owners, and contractors. A broken or confusing onboarding flow creates immediate trust erosion and increases support burden by 40%.

**What this protects:** 
- Prevents abandoned setups
- Protects users from configuration errors
- Ensures proper data flow from day one

**Business impact:** A zero-click onboarding reduces time-to-value from 45 minutes to under 5 minutes, directly impacting trial-to-paid conversion.

## Implementation Steps

### Step 1: Create the onboarding page structure

Create `pages/onboarding/index.tsx`:

```tsx
import OnboardingWizard from '../../components/OnboardingWizard'
export default function OnboardingPage() {
  return <OnboardingWizard />
}
```

### Step 2: Build the core wizard component

Create `components/OnboardingWizard.tsx`:

```tsx
'use client'
import { useState } from 'react'
import PersonaSelector from './PersonaSelector'
import DataImporter from './DataImporter'
import PersonaFlow from './PersonaFlow'
import DashboardGenerator from './DashboardGenerator'
import CopilotTip from './CopilotTip'

export default function OnboardingWizard() {
  const [step, setStep] = useState(0)
  const [persona, setPersona] = useState('')
  const [importedData, setImportedData] = useState<any>(null)

  const next = () => setStep(s => Math.min(3, s + 1))
  const back = () => setStep(s => Math.max(0, s - 1))

  const canProceed = () => {
    if (step === 0 && !persona) return false
    if (step === 1 && !importedData) return false
    return true
  }

  return (
    <div className="max-w-3xl mx-auto p-4 flex flex-col gap-6">
      {step === 0 && <PersonaSelector onSelect={p => { setPersona(p); next() }} />}
      {step === 1 && <DataImporter onImport={data => { setImportedData(data); next() }} />}
      {step === 2 && persona && importedData && <PersonaFlow persona={persona} data={importedData} onComplete={next} />}
      {step === 3 && persona && importedData && <DashboardGenerator data={importedData} persona={persona} />}
      <div className="flex justify-between">
        <button onClick={back} disabled={step === 0} className="btn-secondary">Back</button>
        <button onClick={next} disabled={step === 3 || !canProceed()} className="btn-primary">Next</button>
      </div>
      <CopilotTip step={step} persona={persona} />
    </div>
  )
}
```

### Step 3: Add base styling

Update `styles/globals.css` to include:

```css
.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed;
}
```

## Test & Validation Instructions

### Verification steps:
1. Run `npm run dev`
2. Navigate to `http://localhost:3000/onboarding`
3. Verify the wizard container renders with proper spacing
4. Check that navigation buttons appear at the bottom
5. Ensure the Next button is disabled initially

### Expected console output:
- No errors or warnings
- Clean React hydration

### QA criteria:
- [ ] Wizard renders without errors
- [ ] Step state initializes at 0
- [ ] Navigation buttons are visible
- [ ] Layout is centered and responsive

## Commit Message

```
feat(onboarding): implement core wizard component and page structure

- Add onboarding page at /onboarding route
- Create OnboardingWizard component with step management
- Implement navigation controls with state validation
- Add base button styling for primary/secondary actions
```

## Cleanup/Integration

1. Ensure `components/` directory exists in project root
2. Verify Next.js routing is configured for `/pages` directory
3. Update any existing navigation to include link to `/onboarding`
4. No temporary files to remove in this sprint