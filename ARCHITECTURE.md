# MyRoofGenius Architecture

## Protected Systems
- Authentication: Auto-refreshing sessions with fallback
- Payments: Idempotent webhook processing with replay protection  
- Data: Autosave with localStorage backup
- Performance: Parallel loading with graceful degradation

## Critical Paths
1. Login → Dashboard (must load < 1s)
2. Product → Checkout → Success (must handle all payment states)
3. Copilot Interaction (must never lose messages)
4. Roof Analysis (must handle large images gracefully)
