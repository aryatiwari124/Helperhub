---
name: NeighborlyTasks
colors:
  surface: '#fcf9f4'
  surface-dim: '#dcdad5'
  surface-bright: '#fcf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ee'
  surface-container: '#f0ede9'
  surface-container-high: '#ebe8e3'
  surface-container-highest: '#e5e2dd'
  on-surface: '#1c1c19'
  on-surface-variant: '#56423c'
  inverse-surface: '#31302d'
  inverse-on-surface: '#f3f0eb'
  outline: '#8a726b'
  outline-variant: '#ddc0b9'
  surface-tint: '#a04022'
  primary: '#9d3e20'
  on-primary: '#ffffff'
  primary-container: '#bd5536'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb59f'
  secondary: '#49654a'
  on-secondary: '#ffffff'
  secondary-container: '#c8e8c5'
  on-secondary-container: '#4d6a4e'
  tertiary: '#8b4c11'
  on-tertiary: '#ffffff'
  tertiary-container: '#a96428'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb59f'
  on-primary-fixed: '#3a0a00'
  on-primary-fixed-variant: '#80290d'
  secondary-fixed: '#cbebc8'
  secondary-fixed-dim: '#afcfad'
  on-secondary-fixed: '#06210b'
  on-secondary-fixed-variant: '#324d33'
  tertiary-fixed: '#ffdcc4'
  tertiary-fixed-dim: '#ffb780'
  on-tertiary-fixed: '#2f1400'
  on-tertiary-fixed-variant: '#6f3800'
  background: '#fcf9f4'
  on-background: '#1c1c19'
  surface-variant: '#e5e2dd'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Work Sans
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
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system is built to feel like a digital extension of a vibrant neighborhood community. The aesthetic moves away from the sterile, transactional nature of traditional gig platforms, instead favoring a warm, human-centric approach. 

The style is **Modern-Organic**, blending the cleanliness of modern SaaS with the approachability of soft edges and natural tones. It prioritizes high legibility and clear visual hierarchies to ensure users of all ages and technical backgrounds feel comfortable navigating the marketplace. The interface relies on generous whitespace and a "friendly-first" logic where every interaction feels supportive and local rather than corporate.

## Colors

The palette is inspired by natural materials and community spaces. 

- **Primary (Terracotta):** Used for primary actions and brand presence. It conveys warmth and energy without the aggression of pure red.
- **Secondary (Herbal Green):** Used for "Verified" badges, success states, and growth-related metrics. It anchors the brand in trust.
- **Tertiary (Soft Amber):** Used for ratings, highlights, and secondary calls to action.
- **Neutral (Warm Creams/Charcoals):** The light mode base is a soft off-white (`#FAF7F2`) to reduce eye strain and feel more "paper-like" than digital. Dark mode avoids pure blacks, utilizing deep, warm charcoals (`#2D2A26`) to maintain the "warmth" even in low-light settings.

## Typography

The typography system uses a pairing of **Plus Jakarta Sans** for headings and **Work Sans** for body and UI elements. 

- **Headings:** The rounded terminals of Plus Jakarta Sans provide a friendly, welcoming character. Use Bold weights for primary headlines to create a strong "local news" feel.
- **Body:** Work Sans is chosen for its exceptional readability and neutral, trustworthy stance. It handles dense task descriptions and chat interfaces with ease.
- **Hierarchy:** Maintain a clear vertical rhythm. Display and Headline styles should always use the Primary or deep Neutral color to ensure they feel grounded.

## Layout & Spacing

This design system employs a **Fluid-Responsive Grid** based on an 8px base unit. 

- **Desktop:** A 12-column grid with a 1280px max-width container. Centralized layouts are preferred to evoke a "community bulletin board" feel.
- **Mobile:** A 4-column grid with 16px side margins.
- **Spacing Rhythm:** Use "Generous" increments. Avoid crowding elements; task cards should have at least 24px of breathing room from their neighbors. Vertical stacking of sections should favor 48px or 64px gaps to keep the UI from feeling cluttered.

## Elevation & Depth

The UI uses a **Layered Card** approach. Depth is communicated through soft, multi-layered shadows rather than heavy borders or flat planes.

- **Surface Levels:** 
    - **Level 0 (Base):** The neutral cream/charcoal background.
    - **Level 1 (Cards):** Standard job or profile cards. Features a very soft, diffused shadow (15% opacity primary color tint) to make them appear slightly lifted.
    - **Level 2 (Modals/Hover):** Interactive elements that require immediate attention. Higher blur radius and slightly more shadow density.
- **Interaction:** On hover, cards should subtly lift (negative Y-offset) and the shadow should expand, providing tactile feedback to the user.

## Shapes

The shape language is defined by **Generous Radii**. 

- **Cards:** Use a `rounded-xl` (24px) radius to create a soft, container-like feel that mimics physical neighborhood flyers.
- **Buttons & Inputs:** Use a `rounded-lg` (12px) radius. This provides enough roundness to be approachable while maintaining enough structure to look professional.
- **Icons:** Category icons should be housed in circular or super-elliptical containers to reinforce the friendly brand personality.

## Components

### Buttons
- **Primary:** Terracotta background with white text. High contrast, 12px rounded corners.
- **Secondary:** Herbal Green outline or soft tint. Used for secondary actions like "Save for Later."

### Cards (The Hero Component)
- **Task Cards:** Must include a clear title, a price estimate badge in the top-right, and a "Service Category" chip. Use 24px corner radius and Level 1 elevation.
- **Profile Cards:** Feature a circular avatar of the neighbor/pro, a rating badge (Amber), and their primary skill tag.

### Form Inputs
- Inputs should use a subtle warm-gray border that thickens and changes to Terracotta on focus. 
- Use floating labels or clear persistent labels to ensure accessibility for all users.

### Category Chips
- Small, pill-shaped tags used for filtering (e.g., "Plumbing", "Gardening").
- Active state: Solid Herbal Green. 
- Inactive state: Soft cream with a thin border.

### Feedback & Status
- **Success:** Herbal Green with icon.
- **Warning/Pending:** Amber.
- All status indicators should use "Soft" rounded corners (8px) to keep them in line with the overall brand aesthetic.