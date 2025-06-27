# Sprint Task: Configure Feature Flags for Launch

## Why This Matters
Feature flags control what customers see on day one. A misconfigured flag can expose unfinished features, crash the app, or hide revenue-generating functionality. This is your safety net.

## What This Protects
- Unfinished features from public exposure
- System stability during rollout
- Controlled feature deployment
- Quick disable capability if issues arise

## Feature Flag Inventory

The application uses these feature toggles, controlled via environment variables:

### 1. AI Copilot Feature
```
NEXT_PUBLIC_AI_COPILOT_ENABLED=true
```
**Controls:** AI-powered assistance features
**Default:** true
**Recommendation:** Keep enabled if OpenAI key is configured

### 2. AR Mode (Augmented Reality)
```
NEXT_PUBLIC_AR_MODE_ENABLED=true
```
**Controls:** AR visualization features
**Default:** true
**Recommendation:** Set to **false** unless AR is fully tested

### 3. Sales/Marketplace
```
SALES_ENABLED=true
```
**Controls:** Entire marketplace functionality
**Default:** true
**Recommendation:** Keep enabled for revenue generation

### 4. Additional Flags (If Present)
Check codebase for any other feature flags:
```bash
grep -r "NEXT_PUBLIC_.*_ENABLED" . --include="*.ts" --include="*.tsx"
grep -r "process.env.*_ENABLED" . --include="*.ts" --include="*.tsx"
```

## Configuration Steps

### 1. Evaluate Each Feature

For each flag, assess:
- [ ] Is the feature complete and tested?
- [ ] Are all dependencies configured (API keys, etc.)?
- [ ] Has it been QA tested on staging?
- [ ] Is documentation ready?
- [ ] Can support handle questions about it?

### 2. Set Production Values

In Vercel Dashboard → Settings → Environment Variables:

**For Launch-Ready Features:**
```
NEXT_PUBLIC_AI_COPILOT_ENABLED=true
SALES_ENABLED=true
```

**For Beta/Incomplete Features:**
```
NEXT_PUBLIC_AR_MODE_ENABLED=false
```

### 3. Implement Flag Checking Code

Ensure all feature-flagged code properly checks the flag:

```typescript
// Example: AI Copilot feature check
if (process.env.NEXT_PUBLIC_AI_COPILOT_ENABLED === 'true') {
  return <AICopilotComponent />
} else {
  return <div className="text-gray-500">
    AI Copilot coming soon
  </div>
}
```

### 4. Create Flag Documentation

Document in `docs/FEATURE_FLAGS.md`:

```markdown
# Feature Flag Configuration

## Active Feature Flags

### AI_COPILOT_ENABLED
- **Purpose:** Controls AI-powered assistance features
- **Default:** true
- **Dependencies:** Requires OPENAI_API_KEY
- **Impact:** Hides AI estimation, suggestions, and copilot UI

### AR_MODE_ENABLED
- **Purpose:** Controls augmented reality visualization
- **Default:** false (beta feature)
- **Dependencies:** WebXR browser support
- **Impact:** Hides AR view buttons and menu items

### SALES_ENABLED
- **Purpose:** Controls marketplace and checkout
- **Default:** true
- **Dependencies:** Stripe configuration
- **Impact:** Disables entire marketplace if false
```

## Testing Feature Flags

### 1. Local Testing
```bash
# Test with feature disabled
NEXT_PUBLIC_AR_MODE_ENABLED=false npm run dev

# Test with feature enabled
NEXT_PUBLIC_AR_MODE_ENABLED=true npm run dev
```

### 2. Verify UI Changes
For each flag state, verify:
- [ ] UI elements appear/hide correctly
- [ ] No broken links to disabled features
- [ ] Appropriate messaging for disabled features
- [ ] No console errors when disabled

### 3. Test Graceful Degradation
```javascript
// In browser console, test missing flags:
// Temporarily override to test
window.process = { env: {} };
// Reload page and ensure no crashes
```

## Quick Toggle Implementation

Add admin controls for runtime flag changes:

```typescript
// In app/admin/settings/page.tsx (if needed)
interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

const flags: FeatureFlag[] = [
  {
    key: 'AI_COPILOT_ENABLED',
    label: 'AI Copilot',
    description: 'AI-powered assistance features',
    enabled: process.env.NEXT_PUBLIC_AI_COPILOT_ENABLED === 'true'
  },
  // ... other flags
];

// Allow admins to toggle without redeployment
// Store overrides in database or localStorage
```

## Launch Day Flag Strategy

### Phase 1: Soft Launch (Day 1)
- AI Copilot: Enabled (core feature)
- Marketplace: Enabled (revenue critical)
- AR Mode: Disabled (not ready)

### Phase 2: Monitor & Adjust (Days 2-7)
- Monitor error rates for each feature
- If AI features cause issues: Disable via Vercel
- If marketplace has problems: Can disable for fixes

### Phase 3: Feature Expansion (Week 2+)
- Enable AR mode after additional testing
- Add new feature flags for upcoming features
- Use percentage rollouts if implementing advanced flags

## Emergency Flag Controls

If a feature causes production issues:

### Quick Disable (2 minutes):
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Change flag to `false`
4. Redeploy (automatic)

### Even Quicker (use API):
```bash
# Via Vercel CLI
vercel env rm NEXT_PUBLIC_AR_MODE_ENABLED production
vercel env add NEXT_PUBLIC_AR_MODE_ENABLED production < "false"
vercel --prod --force
```

## Success Criteria
- [ ] All feature flags documented
- [ ] Each flag tested in both states
- [ ] Production values set correctly in Vercel
- [ ] Emergency disable process tested
- [ ] Team knows how to toggle flags quickly