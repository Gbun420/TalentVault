# Aurora Glass 2026 - UI Implementation Tasks

## Planning
- [ ] Confirm target pages/routes for Employer Candidate Search experience.
- [ ] Inventory existing layout/components to reuse vs replace.
- [ ] Define token map for glass colors, shadows, and blur levels.

## Layout and Structure
- [ ] Implement radial gradient canvas background (`#F0F9FF` to `#E0E7FF`).
- [ ] Build fixed 260px frosted sidebar layout shell.
- [ ] Build 80px sticky top bar with glass styling.
- [ ] Apply main content padding 40px and responsive grid rules.

## Search Command Bar
- [ ] Create glass container spanning content width.
- [ ] Add search input with icon, placeholder, and focus expansion (+10%).
- [ ] Implement focus glow `box-shadow: 0 4px 20px -5px rgba(208, 240, 253, 0.6)`.
- [ ] Implement filter chip set with active state styling.

## CV Card Component
- [ ] Implement base material styles (radius, gradient sheen, border, shadow).
- [ ] Add hover elevation and border brighten behavior.
- [ ] Build header row with avatar ring and lock/unlock icon.
- [ ] Implement name/role typography and meta bento grid.
- [ ] Add skill cloud badges.
- [ ] Add footer action bar with "View Profile" button.

## Locked and Unlocked States
- [ ] Implement locked blur + gradient mask overlay.
- [ ] Add centered glass pill with "Unlock Full Profile" and hover "1 Credit Cost".
- [ ] Implement unlocked state transition and brightness flash animation.
- [ ] Add "Contact Candidate" action with Direct Email + LinkedIn fields.

## Iconography System
- [ ] Apply Airline icon set rules (1.5px strokes, round caps/joins, 24x24 grid).
- [ ] Implement color rules for default, hover, active states.

## Responsive and Performance
- [ ] Implement mobile layout rules (< 768px) with floating bottom dock.
- [ ] Reduce blur to `backdrop-blur-md` on mobile.
- [ ] Enforce touch targets at 44x44px minimum.
- [ ] Apply `transform: translateZ(0)` to glass cards.
- [ ] Add low-end device fallback: blur 8px and bg opacity 0.85.

## Micro-interactions
- [ ] Implement button press scale (0.96) and opacity bump (+20%).
- [ ] Add shimmer glass loading state.
- [ ] Implement modal entrance animation and backdrop fade.

## QA and Verification
- [ ] Verify hover/focus states across desktop browsers.
- [ ] Verify locked/unlocked transitions and data reveals.
- [ ] Validate mobile performance and layout breakpoints.
