# Sprint Task: Fix Homepage Tagline Test

## Why This Matters
The E2E test suite is failing due to a mismatch between the expected homepage tagline and the actual content. This blocks automated testing and CI/CD pipelines.

## What This Protects
- Continuous integration workflow
- Test suite reliability
- Marketing message consistency

## Decision Required
Choose between two options:

### Option A: Update Test to Match Current Tagline
If keeping **"Your Intelligence Layer for High-Stakes Roofing"**:

```typescript
// In tests/e2e/checkout.spec.ts or similar homepage test file

test('homepage displays correct tagline', async ({ page }) => {
  await page.goto('/')
  
  // Update this line:
  // OLD: await expect(page.locator('h1')).toContainText('Stop Guessing. Start Winning.')
  // NEW:
  await expect(page.locator('h1')).toContainText('Your Intelligence Layer for High-Stakes Roofing')
})
```

### Option B: Update Homepage to Match Original Marketing
If reverting to **"Stop Guessing. Start Winning."**:

```tsx
// In components/HeroSection.tsx or app/page.tsx

// Update the hero title:
<h1 className="text-4xl md:text-6xl font-bold mb-6">
  Stop Guessing. Start Winning.
</h1>
```

## Implementation Steps

1. **Make the Decision**: Confirm with stakeholders which tagline is approved
2. **Update Either Test or Component**: Apply the chosen change above
3. **Run Tests Locally**: 
   ```bash
   npm run test:e2e
   ```
4. **Verify All Tests Pass**: No failures should remain

## Success Criteria
- [ ] E2E test suite runs without failures
- [ ] Homepage displays the approved tagline
- [ ] Marketing consistency across all materials
- [ ] CI/CD pipeline runs green