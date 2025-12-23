# Aurora Glass 2026 - Employer Search Experience

## Purpose
Define the spatial layout, component anatomy, and interaction protocols for the Employer Candidate Search flow. This spec is the implementation source of truth for the Aurora Glass UI system in the search experience.

## Visual Foundation
- Background gradient: radial, center `#F0F9FF` to edges `#E0E7FF`.
- Glass language: layered translucency, soft borders, subtle sheen, minimal hard dividers.
- Calm density: use consistent vertical rhythm to avoid clutter.

## Layout Structure
- Left sidebar (navigation): 260px wide, fixed, frosted glass (`bg-white/70`, `backdrop-blur-xl`).
- Top bar (filters/search): 80px tall, sticky, glass (`bg-white/80`).
- Main content: fluid width, padding 40px.

## Search Command Bar
Location: top of main content area (not in navbar).

- Container: unified glass panel spanning content width.
- Input field:
  - Icon: magnifying glass, Soft Graphite.
  - Placeholder: "Search by role, skill, or company..."
  - Focus state: width expands by 10%, bottom glow `box-shadow: 0 4px 20px -5px rgba(208, 240, 253, 0.6)`.
- Filter chips:
  - 16px below the search bar.
  - Pill shape, `rounded-full`, background `rgba(255,255,255, 0.4)`, border `1px solid rgba(255,255,255, 0.6)`.
  - Active: fill `#0F2C4F` at 10% opacity, text `#0F2C4F`.
  - Typography: 13px, medium weight.

## CV Card (Glass Object)

### Dimensions and Material
- Height: auto (min 180px).
- Radius: 16px.
- Background: `bg-white/60` with `bg-gradient-to-br from-white/40 to-transparent`.
- Border: `1px solid rgba(255, 255, 255, 0.5)`.
- Shadow: `0 4px 24px -1px rgba(15, 44, 79, 0.06)`.
- Hover:
  - Translate Y: -4px.
  - Shadow: `0 12px 32px -1px rgba(15, 44, 79, 0.12)`.
  - Border brightens: `1px solid rgba(255, 255, 255, 0.9)`.

### Information Hierarchy
1. Header row (flex):
   - Left: avatar 40px circle, 2px white border with 2px gap (ring).
   - Right: locked padlock or unlocked checkmark.
2. Name and role:
   - Name: H3, 20px, `#0F2C4F`.
   - Role: 18px, `#64748B`.
3. Meta tags (bento grid):
   - Location (icon + text), experience, salary.
   - Text 14px, `#475569`.
4. Skill cloud:
   - 3-4 pill badges, `bg-slate-100/50`, text `#334155`.
5. Action bar (footer):
   - Divider: `1px` line `bg-white/40`.
   - Right aligned secondary glass button: "View Profile".

## Locked vs Unlocked State Logic

### Locked (default)
- Apply `backdrop-blur-sm` to main body.
- Overlay gradient mask: `bg-gradient-to-t from-white/60 via-white/20 to-transparent`.
- Text becomes unreadable but silhouette visible.
- Centered glass pill:
  - Text: "Unlock Full Profile".
  - Background: `bg-slate-900/5`.
  - Hover: reveals "1 Credit Cost" label.

### Unlocked (purchased)
- Remove blur and masks instantly.
- Entrance animation: brightness flash `1.1 -> 1.0` over 400ms.
- Unlock button becomes "Contact Candidate".
- Reveal fields: Direct Email, LinkedIn URL with subtle Ice Cyan highlight.

## Iconography: Airline System
- Grid: 24x24.
- Stroke width: 1.5px.
- Line caps/joins: round.
- Style: outline by default; filled only for active or critical alerts.
- Colors:
  - Default: `#64748B`.
  - Hover: `#0F2C4F`.
  - Active: Ice Cyan background with Sapphire text.

## Responsive and Performance Guidelines

### Mobile (< 768px)
- Reduce blur to `backdrop-blur-md` (12px).
- Sidebar becomes bottom floating island dock, frosted glass, 20px off bottom, capsule shape.
- Card grid becomes single column stack.
- Touch targets: minimum 44x44px.

### Performance
- Force GPU: `transform: translateZ(0)` on glass cards.
- Use `will-change` only on animated elements.
- Low-end device fallback (JS detection):
  - `backdrop-filter: blur(8px)`.
  - Increase background opacity to 0.85.

## Micro-interactions
- Button press:
  - Scale to 0.96 instantly.
  - Background opacity +20%.
  - Release: elastic ease-out to 1.0.
- Loading states:
  - Shimmer glass: `bg-gradient-to-r from-transparent via-white/40 to-transparent` moving across glass.
- Modal entrance:
  - Backdrop opacity 0 -> 0.4.
  - Scale 0.95 -> 1.0 with fade-in.
  - Easing: `cubic-bezier(0.16, 1, 0.3, 1)`.

## Acceptance Criteria
- Layout matches sidebar/topbar/main content constraints.
- Search command bar contains expanding input and filter chips with defined styles.
- CV cards match material, hierarchy, and hover behavior.
- Locked/unlocked states visually distinct with defined transitions.
- Airline icon style applied consistently.
- Mobile layout and performance fallbacks implemented.
- Micro-interactions match timing and easing definitions.
