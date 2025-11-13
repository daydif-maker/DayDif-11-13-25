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
- **Primary:** Blinkist green background (primary token) with textInverse
- **Secondary:** backgroundSecondary with border
- **Outline:** Transparent background with primary border and primary text
- **Ghost:** Transparent background with primary text
- **States:** 
  - Loading: ActivityIndicator with theme-aware color (textInverse for primary, primary for outline/ghost)
  - Disabled: 0.5 opacity, border color for background
- **Height:** 48px minimum touch target
- **Haptic Feedback:** Light impact on press (enabled by default)
- **Active Opacity:** 0.7 on TouchableOpacity

#### Card
- **Variants:** elevated, flat, outlined, featured
- **Elevated:** Uses `shadows.md` token (subtle depth, 2px offset, 4px radius, 0.1 opacity)
- **Featured:** Uses `shadows.lg` token (prominent depth, 4px offset, 8px radius, 0.15 opacity)
- **Outlined:** No shadow, 1px border using `border` color token
- **Flat:** No shadow, no border
- **Border Radius:** 12px (lg) default
- **Padding:** 24px (lg) default for primary content, 16px (md) for compact
- **Haptic Feedback:** Light impact on press (enabled by default)

#### GlassTabBar (Navigation)
- **Background:** Dark teal (#1A3A52) matching Blinkist
- **Active State:** Green (#00A86B) icon, text, and underline
- **Inactive State:** White icons and text
- **Icons:** Ionicons (home, calendar) with filled/outline variants
- **Green Underline:** 2px height, 24px width for active tab

#### Text
- All text uses semantic color tokens (textPrimary, textSecondary, textTertiary, textInverse, textDisabled)
- Supports all typography variants
- Proper line heights for readability
- No inline fontWeight styles - use variants instead

#### ScreenHeader
- **Component:** Reusable screen header component
- **Title:** Heading1 variant (36px bold)
- **Underline:** Green accent bar (3px height, 40px width, primary color)
- **Subtitle:** Optional bodySmall text in textSecondary color
- **Usage:** Standardizes screen headers across Today and Plans screens

#### LoadingState
- **Component:** Centered loading indicator with optional message
- **Indicator:** Large ActivityIndicator using primary color token
- **Message:** Optional bodySmall text in textSecondary color
- **Layout:** Centered vertically and horizontally with lg padding
- **Usage:** Replace basic "Loading..." text with polished loading states

#### EmptyState
- **Component:** Empty state display with icon, heading, description, and optional action
- **Icon:** Optional Ionicons icon (48px, tertiary color)
- **Heading:** Heading3 variant (20px semibold)
- **Description:** Body text in textSecondary color
- **Action:** Optional primary button for user actions
- **Layout:** Centered with lg padding
- **Usage:** Display when no data is available (e.g., empty day history)

#### Input
- **Label:** Optional bodySmall text in textSecondary
- **Border:** 1px border using border token (borderError when invalid)
- **Text:** Uses textPrimary color token, fontSize16 typography token
- **Placeholder:** Uses textTertiary color token
- **Error State:** Red border (borderError) and error message in caption variant
- **Helper Text:** Optional caption text in textTertiary or error color

#### ProgressBar
- **Height:** Configurable via spacing tokens (default: sm/8px)
- **Color:** Uses primary color token (theme-aware)
- **Background:** Uses backgroundSecondary color token
- **Animation:** Smooth 500ms transition using react-native-reanimated
- **Border Radius:** Full (pill shape)

#### AudioPlayer
- **Play/Pause Button:** 48px circular button with primary background
- **Icons:** Ionicons play/pause icons (24px, textInverse color)
- **Progress:** Uses ProgressBar component
- **Time Display:** Caption text in textTertiary color
- **Surface:** surfaceElevated background with top border

### Layout Primitives
- **Stack:** Vertical layout with configurable gap (default: md/16px)
- **Row:** Horizontal layout with configurable gap (default: md/16px)
- **Screen:** Safe area wrapper with background color token
- **Box:** Base primitive for custom layouts using Restyle

### Icon Colors
- **Hook:** `useIconColor()` provides theme-aware icon colors
- **Variants:** primary, secondary, tertiary, inverse, navActive, navInactive
- **Usage:** All Ionicons use this hook instead of hard-coded colors
- **Mapping:**
  - primary → primary color token
  - secondary → textSecondary token
  - tertiary → textTertiary token
  - inverse → textInverse token
  - navActive → navActive token
  - navInactive → navInactive token

**Rule:** No inline styling with non-token values. No hard-coded colors, spacing, shadows, or font sizes.

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

All shadows use theme elevation tokens. Never hard-code shadow values.

#### Elevation Tokens
- **none:** No shadow (transparent, 0 elevation)
- **sm:** Subtle shadow (1px offset, 2px radius, 0.05 opacity, elevation 1)
- **md:** Medium shadow (2px offset, 4px radius, 0.1 opacity, elevation 2) - Used for elevated cards
- **lg:** Large shadow (4px offset, 8px radius, 0.15 opacity, elevation 4) - Used for featured cards
- **xl:** Extra large shadow (8px offset, 16px radius, 0.2 opacity, elevation 8)

#### Usage Guidelines
- **Elevated Cards:** Use `shadows.md` token via theme
- **Featured Cards:** Use `shadows.lg` token via theme
- **Outlined Cards:** No shadow, border only
- **Tab Bar:** No shadow, solid dark teal background
- **Dark Mode:** Shadows automatically adapt via theme tokens

### Typography Hierarchy

#### Usage Guidelines
1. **Screen Titles:** Heading1 (36px bold) with green underline via ScreenHeader component
2. **Section Headers:** Heading3 (20px semibold) with optional descriptive subtitle in bodySmall/secondary
3. **Card Titles:** Heading4 (18px semibold) for consistent card title styling
4. **Content:** Body (16px regular) for primary content with 24px line height
5. **Metadata:** Caption (12px regular) in textTertiary color for labels and metadata

#### Letter Spacing
- **Headings:** Tight letter spacing (-0.5px) for refined appearance
- **Body Text:** Normal letter spacing (0px)

#### Line Heights
- Generous line heights for readability (1.33x to 1.5x font size)
- Ensures comfortable reading experience

### Visual Hierarchy
1. **Screen Titles:** Heading1 with green underline (ScreenHeader component)
2. **Section Headers:** Heading3 with descriptive subtitle in bodySmall/secondary
3. **Card Titles:** Heading4 (standardized) for all card titles
4. **Content:** Body text with proper line height
5. **Metadata:** Caption text in tertiary color with icons

### Interaction Patterns

#### Touch Targets
- **Minimum Size:** 48px × 48px for all interactive elements
- **Spacing:** Adequate spacing between touch targets (minimum 8px)

#### Press Feedback
- **Active Opacity:** 0.7 on all TouchableOpacity components
- **Visual Feedback:** Immediate visual response on press
- **Haptic Feedback:** Light impact on button presses and tab navigation
- **Timing:** Haptic feedback fires before navigation/action

#### Loading States
- **Component:** Use LoadingState component for consistent loading UI
- **Indicator:** Large ActivityIndicator using primary color token
- **Message:** Optional descriptive message in bodySmall/secondary
- **Layout:** Centered with proper spacing

#### Empty States
- **Component:** Use EmptyState component for consistent empty state UI
- **Elements:** Icon (optional), heading (heading3), description (body/secondary), action button (optional)
- **Layout:** Centered with proper spacing
- **Usage:** Display when no data is available (e.g., empty lists, no history)

#### Error States
- **Color:** Use error color token for error messages
- **Border:** borderError token for input borders
- **Text:** Error messages in caption variant with error color
- **Visibility:** Errors should be clear but not jarring

#### Disabled States
- **Opacity:** 0.5 opacity for disabled elements
- **Color:** Use textDisabled color token
- **Interaction:** No haptic feedback or press actions when disabled

## 8. Motion & Animation Guidelines

### Transitions
- **Duration:** 500ms for progress animations (smooth but not sluggish)
- **Easing:** Default React Native timing functions
- **Progress Bars:** Animated width transitions using react-native-reanimated

### Micro-Interactions
- **Button Press:** Immediate visual feedback (0.7 opacity) + haptic feedback
- **Card Press:** Visual feedback + haptic feedback (if enabled)
- **Tab Navigation:** Haptic feedback on tab switch
- **No Animation:** Keep interactions snappy and responsive

### Best Practices
- Use animations sparingly for meaningful feedback
- Prefer subtle transitions over dramatic effects
- Ensure animations don't block user interactions
- Test animations on lower-end devices

## 9. Dark Mode Guidelines

### Color Mappings
- **Backgrounds:** Dark grays (#0A0E14, #141920, #1E252E) for depth hierarchy
- **Text:** High contrast whites and light grays (#FFFFFF, #B8C5D1, #8A9BA8)
- **Primary:** Slightly lighter green (#00C97A) for better visibility on dark
- **Borders:** Darker borders (#2A3441) for subtle separation
- **Shadows:** Shadows work effectively in dark mode via theme tokens

### Contrast Ratios
- **Text Primary:** WCAG AA compliant (4.5:1 minimum)
- **Text Secondary:** WCAG AA compliant for secondary content
- **Interactive Elements:** High contrast for accessibility
- **Borders:** Subtle but visible separation

### Testing Checklist
- Verify all screens in both light and dark themes
- Check icon visibility in both themes
- Ensure proper contrast for all text
- Verify shadows and elevation work correctly
- Test interactive states in both themes

## 10. Component State Patterns

### Loading States
- Use `LoadingState` component for consistent loading UI
- Show loading indicator with optional descriptive message
- Replace basic "Loading..." text with polished component

### Empty States
- Use `EmptyState` component for consistent empty state UI
- Include icon, heading, description, and optional action
- Provide clear guidance on what users can do next

### Error States
- Display error messages using error color token
- Use borderError for input borders when invalid
- Show helpful error messages, not just technical errors

### Disabled States
- Apply 0.5 opacity to disabled elements
- Use textDisabled color token
- Prevent interactions when disabled

## 11. Storybook & Documentation
- storybook/* shows component states.
- docs/contributing.md defines coding standards.

---

## 12. Quality Gates

| Command | Status |
|--------|--------|
| npm run lint | Pass |
| npm run typecheck | Pass |
| npm run tokens:scan | Pass |
