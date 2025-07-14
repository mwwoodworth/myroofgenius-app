# Client/Server Component Boundary Fixes

## Changelog
- Added "use client" to `components/PageTransitionWrapper.tsx` to enable client hooks.
- Converted imports of client components in server files to dynamic imports within functions for:
  - `app/layout.tsx`
  - various `app/*/page.tsx` files (account, admin pages, marketplace, tools, etc.)
- Moved `StarfieldBackground.tsx` into `components/ui` and updated header import.
- Updated `RemoteModelViewer.tsx`, `Starfield.tsx`, and `MarketplaceClient.tsx` to fix build-time type errors.
