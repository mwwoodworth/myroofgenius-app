# Sprint Task: Remove Legacy Redirects

## Why This Matters
The current redirects in `next.config.js` are blocking access to the Marketplace and Tools pages, which are now fully implemented. Users clicking these nav links will be redirected away from actual content.

## What This Protects
- Marketplace revenue flow
- AI Tools accessibility
- User navigation integrity

## Implementation Steps

### 1. Open `next.config.js`

### 2. Locate and Remove These Redirect Rules:
```javascript
// DELETE THESE LINES:
{
  source: '/tools',
  destination: '/estimator',
  permanent: false,
},
{
  source: '/marketplace',
  destination: '/',
  permanent: false,
}
```

### 3. Updated Redirects Section Should Look Like:
```javascript
async redirects() {
  return [
    // Keep any other redirects that are still needed
    // But remove the /tools and /marketplace redirects
  ]
}
```

### 4. Verify Changes
- Run `npm run dev`
- Navigate to `/marketplace` - should show product listing
- Navigate to `/tools` - should show AI Tools page
- Both pages should load without redirecting

## Deployment
After making this change:
1. Commit with message: `fix: remove legacy redirects blocking marketplace and tools pages`
2. Push to main branch
3. Trigger Vercel deployment

## Success Criteria
- [ ] /marketplace loads the product listing page
- [ ] /tools loads the AI Tools page
- [ ] No unwanted redirects occur
- [ ] E2E tests pass for both pages