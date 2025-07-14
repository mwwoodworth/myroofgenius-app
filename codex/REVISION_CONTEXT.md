# ✅ Codex Revision Sprint: MyRoofGenius Final UI & Motion Overhaul

This document includes all structured prompts and task context for Codex to autonomously implement the final pre-launch upgrades to MyRoofGenius.

## 🧠 Global Context File
**File:** `/codex/REVISION_CONTEXT.md`

```
This file contains a merged audit and synthesis from Perplexity, Claude, Gemini, GPT-4.1, and founder input. It describes exactly what Codex is expected to do across UI, motion, layout, color, and content blocks.

Codex must:
- Implement modern SaaS-grade visuals, including darker blue → tech purple gradients
- Reintroduce subtle starfield animation in the header (desktop only)
- Add hover/scroll FX to navbar
- Redesign hero section with stronger CTA, more visual contrast
- Implement sticky mobile CTA banner
- Add testimonial + trust section with animated logos
- Refactor layout spacing, padding, and mobile breakpoints
- Ensure Framer Motion is used for all transitions and entrance animations
- All styling = Tailwind + shadcn/ui
- Animate page transitions with fade/slide logic
- Code must be clean, reusable, and readable with clear class structure
- Push all outputs to the Vercel preview branch (`/prelaunch`)