# SPRINT_FINISH_LINE – July 2025

## Goal
Finalize UI polish, a11y, and brand consistency for production parity with best‑performing preview.

### High Priority
1. **Remove White Band**
   * File: `components/Sections/Testimonials.tsx`
   * Replace `bg-[#f8f9fa]` with `bg-gradient-to-b from-[#002D5B] to-[#001A33]`
2. **Subtitle Contrast**
   * File: `styles/theme.ts`
   * Update `$text-subtitle` → `#E6F0FF`
3. **Focus Outlines**
   * File: `components/ui/NavLink.tsx` & global CSS
   * Ensure `:focus-visible { outline:2px solid #4F9CF9; outline-offset:2px }`

### Medium Priority
4. **Pulse Enhancement**
   * Header/body keyframes opacity 0.92–0.96, 8 s cycle
5. **Card Hover Depth**
   * Add `hover:-translate-y-1` & `hover:shadow-lg` to `Card.tsx`
6. **Chat Widget Overlap**
   * Add `pb-28` to `<main>` on screens `<640px>`

### Low Priority
7. **CTA Glow Tone‑down**
   * Box‑shadow alpha 0.2
8. **Blog Image Alts**
   * Add `alt` in MDX front‑matter

---

## Deliverables
1. Branch **finish-line-sprint**
2. PR with all High/Critical items passing QA
3. Lighthouse + Axe scores attached to PR
