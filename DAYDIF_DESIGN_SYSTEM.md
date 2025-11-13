# DayDif Design System & Project Reference

This document describes the **token-driven design system** and supporting tooling used in the DayDif React Native + Expo application.
It exists so any engineer or AI assistant can quickly understand the project's design rules, code structure, and theming architecture.

---

## 1. Overview
- **Style Baseline:** Professional Blinkist-inspired design with clean, intuitive UI and premium aesthetic.
- **Design Philosophy:** Clean, professional, and intuitive interface matching Blinkist's visual language.
- **Token-Driven Architecture:** All UI primitives use **tokens only** — no hard-coded values.
- **Light/Dark Themes:** Built with **Restyle**, synchronized with React Navigation.
- **Strict Guardrails:** ESLint token-only rule, TypeScript strict mode, token scanner, and Storybook coverage ensure consistency and prevent design drift.

### Design Principles
- **Professional & Clean:** Minimal, refined aesthetic with generous spacing
- **Intuitive Navigation:** Clear visual hierarchy with green accent indicators
- **Consistent Typography:** Large, bold headings with proper line heights
- **Subtle Elevation:** Refined shadows and card treatments
- **Green Accent System:** Blinkist green (#00A86B) for primary actions and active states

---

## 2. Design System Directory Structure

```
designSystem/
  ├─ theme.ts
  ├─ darkTheme.ts
  ├─ ThemeProvider.tsx
  └─ ...
```

### theme.ts & darkTheme.ts
- Define palette + semantic roles matching Blinkist aesthetic.
- **Color Palette:**
  - **Navigation:** Dark teal (#1A3A52) for bottom tab bar
  - **Primary/Accent:** Blinkist green (#00A86B) for active states and primary actions
  - **Text Hierarchy:** Refined neutral grays (#212121, #616161, #757575)
  - **Backgrounds:** Clean whites (#FFFFFF) and light grays (#FAFAFA)
- All values derived from tokens.

### ThemeProvider.tsx
- Wraps app with Restyle provider.
- Bridges to navigation theme.

### components/ThemeToggle.tsx
- Handles light/dark switching with persistence.

---

## 3. UI Primitives (ui/)

### Typography
- **Heading1:** 36px, bold, 48px line height - Main screen titles
- **Heading2:** 28px, bold, 40px line height - Section headers
- **Heading3:** 20px, semibold, 28px line height - Subsection headers
- **Heading4:** 18px, semibold, 24px line height - Card titles
- **Body:** 16px, regular, 24px line height - Primary content
- **BodySmall:** 14px, regular, 20px line height - Secondary content
- **Caption:** 12px, regular, 16px line height - Metadata and labels

### Components

#### Button
- **Variants:** primary (green), secondary, outline, ghost
- **Primary:** Blinkist green background (#00A86B) with white text
- **States:** loading, disabled with proper opacity
- **Height:** 48px minimum touch target

#### Card
- **Variants:** elevated, flat, outlined, featured
- **Elevated:** Subtle shadow (0.08 opacity, 3px radius)
- **Featured:** More prominent shadow (0.12 opacity, 6px radius) for highlighted content
- **Border Radius:** 12px (lg) default
- **Padding:** 24px (lg) default

#### GlassTabBar (Navigation)
- **Background:** Dark teal (#1A3A52) matching Blinkist
- **Active State:** Green (#00A86B) icon, text, and underline
- **Inactive State:** White icons and text
- **Icons:** Ionicons (home, calendar) with filled/outline variants
- **Green Underline:** 2px height, 24px width for active tab

#### Text
- All text uses semantic color tokens (textPrimary, textSecondary, textTertiary)
- Supports all typography variants
- Proper line heights for readability

#### Screen Headers
- **Pattern:** Large title with green underline (3px height, 40px width)
- **Spacing:** Generous padding (24px) and gaps (32px between sections)
- **Subtitles:** Descriptive text in bodySmall/secondary color

### Layout Primitives
- **Stack:** Vertical layout with configurable gap
- **Row:** Horizontal layout with configurable gap
- **Screen:** Safe area wrapper with background color
- **Box:** Base primitive for custom layouts

**Rule:** No inline styling with non-token values.

---

## 4. Screen Patterns

### Today Screen ("For You")
- **Header:** "For You" title with green underline
- **Sections:** 
  - Greeting with avatar
  - Weekly goal progress card
  - Featured daily lesson card
  - "Next Up" queue with outlined cards
- **Spacing:** XL gaps (32px) between major sections

### Plans Screen
- **Header:** "Plans" title with green underline and descriptive subtitle
- **KPI Tiles:** Three elevated cards showing metrics
- **Calendar Grid:** 30-day learning history with green filled days
- **Visual Feedback:** Green background for days with activity

### Detail Screens
- **Navigation Header:** Back button, title, action icons (bookmark, menu)
- **Action Bar:** Dark teal background with Read/Play tabs
- **Content:** Large title, metadata row, description cards
- **Action Button:** Primary green button for main CTA

### Design Patterns
- **Section Headers:** Heading3 with descriptive subtitle in bodySmall/secondary
- **Featured Content:** Featured card variant with prominent shadow
- **List Items:** Outlined cards with proper spacing
- **Metadata:** Icons + caption text in tertiary color

---

## 5. Theming & Navigation

### Color Tokens

#### Navigation Colors
- `navBackground`: #1A3A52 (Dark teal for tab bar)
- `navActive`: #00A86B (Green for active tab)
- `navInactive`: #FFFFFF (White for inactive tab)

#### Primary Colors
- `primary`: #00A86B (Blinkist green - primary actions)
- `primaryLight`: #00C896 (Lighter green variant)
- `primaryDark`: #1A3A52 (Dark teal for navigation)

#### Text Colors
- `textPrimary`: #212121 (Main content)
- `textSecondary`: #616161 (Secondary content)
- `textTertiary`: #757575 (Metadata, captions)
- `textInverse`: #FFFFFF (Text on colored backgrounds)

#### Background Colors
- `background`: #FFFFFF (Main background)
- `backgroundSecondary`: #FAFAFA (Card backgrounds)
- `surface`: #FFFFFF (Card surfaces)
- `border`: #EEEEEE (Borders and dividers)

### ThemeProvider
- Wraps app with Restyle provider
- Bridges to React Navigation theme
- Supports light/dark mode switching
- Synchronizes navigation bar colors

---

## 6. Global Tooling & Configuration

| Path | Purpose |
|------|---------|
| .prettierrc.json | Formatting |
| .vscode/settings.json | Aliases |
| babel.config.js | Module resolver |
| metro.config.js | Path aliasing |
| tsconfig.json | Strict TS |
| eslint/rules/tokens-only.js | Prevents non-token styles |
| scripts/check-tokens.js | Token-only enforcement |
| jest.config.js | Testing |

---

## 7. Design Guidelines

### Spacing Scale
- `xs`: 4px - Tight spacing
- `sm`: 8px - Small gaps
- `md`: 16px - Default gaps
- `lg`: 24px - Large gaps, card padding
- `xl`: 32px - Section spacing
- `xxl`: 48px - Major section breaks
- `xxxl`: 64px - Screen-level spacing

### Border Radius
- `sm`: 4px - Small elements
- `md`: 8px - Buttons, small cards
- `lg`: 12px - Standard cards (default)
- `xl`: 16px - Large cards
- `full`: 9999px - Pills, avatars

### Shadows & Elevation
- **Elevated Cards:** Subtle shadow (0.08 opacity, 1px offset, 3px radius)
- **Featured Cards:** More prominent (0.12 opacity, 2px offset, 6px radius)
- **Tab Bar:** No shadow, solid dark teal background

### Visual Hierarchy
1. **Screen Titles:** Heading1 with green underline
2. **Section Headers:** Heading3 with descriptive subtitle
3. **Card Titles:** Heading2 or Heading4 depending on importance
4. **Content:** Body text with proper line height
5. **Metadata:** Caption text in tertiary color

### Interaction Patterns
- **Active States:** Green color (#00A86B) for selected/active elements
- **Hover/Press:** 0.7 opacity on TouchableOpacity
- **Haptic Feedback:** Light impact on button presses
- **Loading States:** ActivityIndicator with proper colors

## 8. Storybook & Documentation
- storybook/* shows component states.
- docs/contributing.md defines coding standards.

---

## 9. Quality Gates

| Command | Status |
|--------|--------|
| npm run lint | Pass |
| npm run typecheck | Pass |
| npm run tokens:scan | Pass |
