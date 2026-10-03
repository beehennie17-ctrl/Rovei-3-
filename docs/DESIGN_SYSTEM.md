# Rovei Design System

## Core colour tokens

The authenticated Rovei application uses the locked brand palette:

| Token | Value |
|---|---|
| `--wine` | `#560F1F` |
| `--blush` | `#E7BDC3` |
| `--white` | `#FFFFFF` |
| `--mauve` | `#D2C5CE` |
| `--rose-milk` | `#EECBD1` |
| `--text-primary` | `#24191D` |
| `--text-secondary` | `#74656B` |
| `--border-soft` | `#E7DCE0` |
| `--surface` | `#FFFFFF` |
| `--surface-muted` | `#FAF6F7` |
| `--sidebar-surface` | `#FCF9FA` |
| `--wine-hover` | `#6A1629` |
| `--wine-soft` | `#F6EDEF` |
| `--success` | `#506C5A` |
| `--warning` | `#8A653E` |

No blue is part of the design system.

## Typography

Two typographic personalities are intentionally separated:

- **Sans-serif UI:** Arial/Helvetica system stack for navigation, controls, practical headings, labels, and body copy.
- **Editorial serif:** Georgia/Times stack used selectively for client names, branded emotional emphasis, and premium client-facing moments.

Reusable utilities:

- `.eyebrow`
- `.display`
- `.page-title`
- `.section-title`
- `.body-text`
- `.caption`
- `.editorial-accent`

The product must not become globally serif.

## Spacing

The system is based on 8px rhythm, with half-step values where controls need optical balance. Common layout values:

- Page gutters: `clamp(20px, 4vw, 56px)`
- Card padding: 24–32px
- Major section gaps: 32–40px
- Control height: 44–48px
- Compact control height: 36px

## Radii

- Small: `12px`
- Medium: `18px`
- Large: `28px`
- Extra large: `36px`
- Pills: full radius

## Shadows

- `--shadow-soft`: broad low-opacity Wine-tinted ambient shadow.
- `--shadow-card`: lighter everyday card elevation.

Shadows should remain subtle and must not create floating glass panels.

## Motion

- Most transitions: about 190ms.
- Card lift: maximum 2px.
- Button press: subtle scale only.
- Page entrance: gentle opacity + 7px vertical movement.
- Micro-shimmer: rare, low-opacity pass with a long idle phase.
- `prefers-reduced-motion` collapses animation/transition duration.

## Client Card design rules

The signature card is a reusable `ClientCard` with the following locked rules:

- Vertical format.
- Rounded/arched top silhouette using a strong elliptical top radius.
- Theme-coloured top section.
- Light, readable lower section.
- Fine theme-coloured full-card outline.
- Restrained cosmetic micro-texture.
- Barely visible shimmer; never glitter-like.
- Editorial serif reserved for the client name.
- Top supports client name, client type, service, and status.
- Lower section supports readiness-related rows and CTA.
- Theme values come from centralized theme objects, not scattered hard-coded styling.
- Every client-facing `ClientTheme` defines `onPrimary` explicitly; text placed directly on `primary` uses `onPrimary` rather than component-level brightness guessing.
- The final Client Card CTA uses `theme.primary` for its background and `theme.onPrimary` for its text/icon so the arch, outline, and CTA share the same theme language.

Default foundation example: Wine theme, Emily Carter, New client, Lash Set, Ready.

## Accessibility

- Semantic links/buttons are used for interactive controls.
- Reusable `Button` controls default to `type="button"`; callers opt into `type="submit"` explicitly.
- Focus-visible rings use Wine-derived styling.
- Inputs have support for explicit labels through `Field`.
- Status is represented by text in addition to colour.
- Reduced-motion preferences are respected.
- Body copy uses high-contrast charcoal rather than pale decorative colours.
- Mobile controls are sized for comfortable touch interaction.
