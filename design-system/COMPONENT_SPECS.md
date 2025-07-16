# MyRoofGenius Design System - Component Specifications

## Component Export Documentation

This document provides detailed specifications for all components in the MyRoofGenius design system, suitable for design handoff and Figma integration.

## Color Tokens

### Primary Colors
- **Primary**: `#3b82f6` (RGB: 59, 130, 246)
- **Primary Hover**: `#2563eb` (RGB: 37, 99, 235)
- **Accent**: `#10b981` (RGB: 16, 185, 129)
- **Accent Hover**: `#059669` (RGB: 5, 150, 105)

### Semantic Colors
- **Success**: `#10b981` (RGB: 16, 185, 129)
- **Warning**: `#f59e0b` (RGB: 245, 158, 11)
- **Error**: `#ef4444` (RGB: 239, 68, 68)
- **Info**: `#3b82f6` (RGB: 59, 130, 246)

### Background Colors
- **Background Primary**: `#0a0a0a` (RGB: 10, 10, 10)
- **Background Secondary**: `#111111` (RGB: 17, 17, 17)
- **Background Tertiary**: `#1a1a1a` (RGB: 26, 26, 26)

### Text Colors
- **Text Primary**: `#f3f4f6` (RGB: 243, 244, 246)
- **Text Secondary**: `#d1d5db` (RGB: 209, 213, 219)
- **Text Muted**: `#9ca3af` (RGB: 156, 163, 175)

### Glass Effect
- **Glass Background**: `rgba(255, 255, 255, 0.08)`
- **Glass Background Hover**: `rgba(255, 255, 255, 0.12)`
- **Glass Border**: `rgba(255, 255, 255, 0.15)`

## Typography Scale

### Font Families
- **Primary**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Monospace**: 'JetBrains Mono', 'Fira Code', Consolas, monospace

### Font Sizes (Responsive)
- **XS**: 12px - 14px (clamp: 0.75rem, 2vw, 0.875rem)
- **SM**: 14px - 16px (clamp: 0.875rem, 2.5vw, 1rem)
- **Base**: 16px - 18px (clamp: 1rem, 2.5vw, 1.125rem)
- **LG**: 18px - 20px (clamp: 1.125rem, 3vw, 1.25rem)
- **XL**: 20px - 24px (clamp: 1.25rem, 3.5vw, 1.5rem)
- **2XL**: 24px - 32px (clamp: 1.5rem, 4vw, 2rem)
- **3XL**: 32px - 40px (clamp: 2rem, 5vw, 2.5rem)
- **4XL**: 36px - 56px (clamp: 2.25rem, 6vw, 3.5rem)

## Spacing Scale

### Base Units
- **1**: 4px
- **2**: 8px
- **3**: 12px
- **4**: 16px
- **5**: 20px
- **6**: 24px
- **8**: 32px
- **10**: 40px
- **12**: 48px
- **16**: 64px
- **20**: 80px
- **24**: 96px

### Responsive Spacing
- **Section**: 32px - 96px (clamp: 2rem, 8vw, 6rem)
- **Grid Gap**: 16px - 32px (clamp: 1rem, 4vw, 2rem)
- **Touch Target**: 44px - 56px (clamp: 44px, 6vw, 56px)

## Component Specifications

### Button Component

#### Variants
1. **Primary**
   - Background: Linear gradient from Primary to Primary Hover
   - Text: White (#ffffff)
   - Border: None
   - Shadow: 0 4px 12px rgba(59, 130, 246, 0.4)

2. **Secondary**
   - Background: #1f2937
   - Text: White (#ffffff)
   - Border: 1px solid #374151
   - Shadow: None

3. **Ghost**
   - Background: Transparent
   - Text: Text Primary (#f3f4f6)
   - Border: None
   - Hover: Background rgba(255, 255, 255, 0.1)

4. **Destructive**
   - Background: #dc2626
   - Text: White (#ffffff)
   - Border: None
   - Shadow: 0 4px 12px rgba(220, 38, 38, 0.4)

5. **Glass**
   - Background: Glass Background
   - Text: White (#ffffff)
   - Border: 1px solid Glass Border
   - Backdrop Filter: blur(12px)

#### Sizes
- **Small**: Padding 12px 16px, Font Size 14px, Min Height 44px
- **Medium**: Padding 16px 20px, Font Size 16px, Min Height 48px
- **Large**: Padding 20px 24px, Font Size 18px, Min Height 56px

#### States
- **Default**: Base styling
- **Hover**: Scale 1.02, increased shadow
- **Active**: Scale 0.98
- **Focus**: 2px ring with Primary color
- **Disabled**: 50% opacity, cursor not-allowed
- **Loading**: Spinner overlay, content hidden

### Card Component

#### Variants
1. **Default**
   - Background: #111827
   - Border: 1px solid #374151
   - Border Radius: 12px
   - Padding: 24px

2. **Glass**
   - Background: Glass Background
   - Border: 1px solid Glass Border
   - Border Radius: 12px
   - Backdrop Filter: blur(12px)
   - Padding: 24px

3. **Interactive**
   - Background: #111827
   - Border: 1px solid #374151
   - Border Radius: 12px
   - Padding: 24px
   - Hover: Scale 1.02, border color #4b5563
   - Cursor: pointer

4. **Elevated**
   - Background: #111827
   - Border: 1px solid #374151
   - Border Radius: 12px
   - Padding: 24px
   - Shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4)

#### Animation
- **Enter**: Fade in from opacity 0, translate Y 20px
- **Duration**: 300ms
- **Easing**: ease-out

### Form Elements

#### Input Field
- **Background**: #1f2937
- **Border**: 1px solid #374151
- **Border Radius**: 8px
- **Padding**: 12px 16px
- **Font Size**: 16px
- **Min Height**: 48px
- **Focus**: 2px ring with Primary color

#### Label
- **Font Size**: 14px
- **Font Weight**: 500
- **Color**: Text Primary (#f3f4f6)
- **Margin Bottom**: 8px

#### Error State
- **Border**: 1px solid #dc2626
- **Background**: rgba(220, 38, 38, 0.1)
- **Error Message**: 12px, #dc2626

### Progress Bar

#### Container
- **Background**: #1f2937
- **Border Radius**: 9999px
- **Height**: 8px
- **Width**: 100%

#### Fill
- **Background**: Linear gradient from Primary to Accent
- **Border Radius**: 9999px
- **Height**: 100%
- **Animation**: Width transition 800ms ease-out

### Toast Notification

#### Container
- **Max Width**: 384px
- **Padding**: 16px
- **Border Radius**: 8px
- **Backdrop Filter**: blur(12px)
- **Shadow**: 0 10px 15px -3px rgba(0, 0, 0, 0.4)

#### Variants
1. **Success**
   - Background: rgba(16, 185, 129, 0.1)
   - Border: 1px solid rgba(16, 185, 129, 0.2)
   - Icon: CheckCircle, #10b981

2. **Error**
   - Background: rgba(239, 68, 68, 0.1)
   - Border: 1px solid rgba(239, 68, 68, 0.2)
   - Icon: XCircle, #ef4444

3. **Warning**
   - Background: rgba(245, 158, 11, 0.1)
   - Border: 1px solid rgba(245, 158, 11, 0.2)
   - Icon: AlertCircle, #f59e0b

4. **Info**
   - Background: rgba(59, 130, 246, 0.1)
   - Border: 1px solid rgba(59, 130, 246, 0.2)
   - Icon: Info, #3b82f6

#### Animation
- **Enter**: Slide in from right (300px), scale 0.9 to 1.0
- **Exit**: Slide out to right (300px), scale 1.0 to 0.9
- **Duration**: 300ms
- **Easing**: Spring (stiffness: 300, damping: 30)

## Animation Specifications

### Timing Functions
- **Base**: cubic-bezier(0.4, 0, 0.2, 1)
- **Spring**: cubic-bezier(0.68, -0.6, 0.32, 1.6)
- **Ease Out**: cubic-bezier(0, 0, 0.2, 1)
- **Ease In**: cubic-bezier(0.4, 0, 1, 1)

### Durations
- **Fast**: 150ms
- **Base**: 200ms
- **Slow**: 300ms
- **Slower**: 500ms

### Motion Principles
- **Reduced Motion**: All animations respect `prefers-reduced-motion: reduce`
- **Haptic Feedback**: Available on supported devices
- **Purpose**: Every animation serves a functional purpose
- **Consistency**: Same timing and easing throughout the system

## Accessibility Specifications

### Focus States
- **Ring Width**: 2px
- **Ring Color**: Primary (#3b82f6)
- **Ring Offset**: 2px
- **Ring Offset Color**: Transparent

### Touch Targets
- **Minimum Size**: 44px × 44px
- **Recommended Size**: 48px × 48px
- **Large Size**: 56px × 56px

### Color Contrast
- **AA Compliance**: 4.5:1 minimum for normal text
- **AAA Compliance**: 7:1 for enhanced accessibility
- **UI Elements**: 3:1 minimum for interactive elements

## Design Tokens Export

```json
{
  "colors": {
    "primary": "#3b82f6",
    "primaryHover": "#2563eb",
    "accent": "#10b981",
    "accentHover": "#059669",
    "success": "#10b981",
    "warning": "#f59e0b",
    "error": "#ef4444",
    "info": "#3b82f6",
    "backgroundPrimary": "#0a0a0a",
    "backgroundSecondary": "#111111",
    "backgroundTertiary": "#1a1a1a",
    "textPrimary": "#f3f4f6",
    "textSecondary": "#d1d5db",
    "textMuted": "#9ca3af",
    "glassBg": "rgba(255, 255, 255, 0.08)",
    "glassBgHover": "rgba(255, 255, 255, 0.12)",
    "glassBorder": "rgba(255, 255, 255, 0.15)"
  },
  "spacing": {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px",
    "20": "80px",
    "24": "96px"
  },
  "fontSize": {
    "xs": "12px",
    "sm": "14px",
    "base": "16px",
    "lg": "18px",
    "xl": "20px",
    "2xl": "24px",
    "3xl": "32px",
    "4xl": "36px"
  },
  "borderRadius": {
    "sm": "4px",
    "md": "8px",
    "lg": "12px",
    "xl": "16px",
    "2xl": "24px",
    "full": "9999px"
  },
  "boxShadow": {
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
  }
}
```

## Figma Integration

### Component Structure
Each component should be created as a Figma component with:
- All variants as separate component variants
- Proper auto-layout settings
- Responsive constraints
- Component descriptions
- Design tokens applied as variables

### Naming Convention
- Component: `ComponentName`
- Variant: `ComponentName/Variant`
- State: `ComponentName/Variant/State`
- Size: `ComponentName/Variant/Size`

Example: `Button/Primary/Default/Medium`

This specification document provides all necessary information for design handoff and implementation consistency across the MyRoofGenius platform.