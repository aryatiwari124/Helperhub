---
name: HelperHub Design System
colors:
  surface: '#f8f9fb'
  surface-dim: '#d9dadc'
  surface-bright: '#f8f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f6'
  surface-container: '#edeef0'
  surface-container-high: '#e7e8ea'
  surface-container-highest: '#e1e2e4'
  on-surface: '#191c1e'
  on-surface-variant: '#434654'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f3'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#535f70'
  on-secondary: '#ffffff'
  secondary-container: '#d6e3f7'
  on-secondary-container: '#596576'
  tertiary: '#004e32'
  on-tertiary: '#ffffff'
  tertiary-container: '#006844'
  on-tertiary-container: '#72e9af'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#d6e3f7'
  secondary-fixed-dim: '#bbc7db'
  on-secondary-fixed: '#101c2b'
  on-secondary-fixed-variant: '#3b4858'
  tertiary-fixed: '#82f9be'
  tertiary-fixed-dim: '#65dca4'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005235'
  background: '#f8f9fb'
  on-background: '#191c1e'
  surface-variant: '#e1e2e4'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is rooted in the principles of **Modern Minimalism** with a focus on functional clarity and professional reliability. The target audience includes homeowners seeking frictionless service booking and professionals looking for an organized business platform. 

The UI evokes an emotional response of "effortless trust." By utilizing expansive whitespace, a disciplined blue-centric palette, and a logic-driven layout, the system eliminates cognitive load and communicates competence. Visual depth is achieved through soft, ambient layering rather than decorative elements, ensuring the focus remains entirely on service discovery and task completion.

## Colors
The palette is engineered for professional accessibility. **Deep Trust Blue** serves as the primary anchor for actions and navigation, while **Soft Sky Blue** provides a gentle background for secondary grouping and highlighted states.

The background uses **Pure White** for primary surfaces and **Very Light Gray (#F4F5F7)** to define global canvas areas, creating a subtle contrast that helps card-based content pop. Semantic colors (Success Green, Warning Orange) are reserved strictly for status communication to maintain the minimalist aesthetic.

## Typography
This design system utilizes **Inter** for all roles to maximize systematic consistency and readability. The type scale is optimized for high information density while maintaining an approachable feel.

- **Headlines:** Use tight letter-spacing and bold weights to create a sense of authority and clear section breaks.
- **Body:** Standardized at 16px for optimal legibility. Line heights are generous (1.5x) to prevent visual fatigue during long browsing sessions.
- **Labels:** Used for categories, tags, and small metadata. Uppercase styling is applied to `label-md` to provide structural variety in the absence of secondary font families.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a maximum container width of 1280px. A standard 12-column system is used for desktop, collapsing to 4 columns for mobile.

- **Gutter & Margin:** A consistent 24px gutter maintains airiness between content blocks.
- **Rhythm:** All spacing (padding, margins, component heights) must be multiples of the **4px base unit**.
- **Responsive Behavior:** On mobile devices, side margins reduce to 16px. Cards typically transition from multi-column layouts to single-column vertical stacks to maintain large touch targets.

## Elevation & Depth
Hierarchy is established using **Tonal Layering** and **Ambient Shadows**. The design avoids heavy borders, preferring to use depth to distinguish between the background and interactive elements.

- **Level 0 (Canvas):** Pure White or F4F5F7 background.
- **Level 1 (Cards/Surface):** White background with a 1px #EBEDF0 border and a subtle ambient shadow (0px 2px 4px rgba(0,0,0,0.05)).
- **Level 2 (Hover/Active):** An elevated shadow (0px 8px 16px rgba(0,0,0,0.08)) to indicate interactivity.
- **Level 3 (Modals/Overlays):** A deep, diffused shadow (0px 12px 24px rgba(0,0,0,0.12)) to provide maximum focus.

## Shapes
The design system adopts a **Rounded** shape language to appear approachable and friendly without feeling juvenile. 

Standard components (buttons, inputs) utilize a **0.5rem (8px)** radius. Larger structural components like cards and service containers use **1rem (16px)** to create a softer, modern container feel. Icons and small utility tags (chips) should use the same 8px radius to maintain a unified visual vocabulary.

## Components
- **Buttons:** 
  - *Primary:* Deep Trust Blue background, White text. High-contrast and prominent.
  - *Secondary:* Soft Sky Blue background, Deep Trust Blue text. Used for "Cancel" or "Save for Later."
- **Cards:** White surfaces with 16px rounding and level 1 elevation. Used for service listings, professional profiles, and reviews. 
- **Input Fields:** 8px rounded corners with a 1px #DFE1E6 border. On focus, the border shifts to Deep Trust Blue with a 2px outer glow.
- **Chips & Tags:** Small, low-height indicators with Soft Sky Blue backgrounds. Used for service categories (e.g., "Plumbing," "Electrician").
- **Lists:** Clean, horizontal dividers (1px #EBEDF0) with generous 16px vertical padding for clear touch targets.
- **Booking Progress Bar:** A specialized component using the Primary Blue to show steps in the service scheduling workflow, emphasizing efficiency.