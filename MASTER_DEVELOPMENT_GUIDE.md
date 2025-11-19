# DayDif Master Development Guide

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Source of Truth

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture & Structure](#architecture--structure)
3. [Design System & Principles](#design-system--principles)
4. [Core Development Principles](#core-development-principles)
5. [Tech Stack](#tech-stack)
6. [Project Structure](#project-structure)
7. [State Management](#state-management)
8. [Navigation Architecture](#navigation-architecture)
9. [Services & API Layer](#services--api-layer)
10. [Component Patterns](#component-patterns)
11. [Testing Strategy](#testing-strategy)
12. [Quality Gates](#quality-gates)
13. [Development Workflow](#development-workflow)
14. [Code Style & Standards](#code-style--standards)

---

## Overview

### What is DayDif?

DayDif is a commute-focused AI learning app designed to turn wasted travel time into structured, meaningful daily learning.

**Core Value Proposition:** Distinct Days. Stronger Mind.

### Target Audience

- Busy professionals and students with daily commutes
- People wanting to maximize "dead time"
- Users who prefer audio-first guided learning

### Key Features

#### Today Tab (Command Center)
- Daily greeting with personalized avatar
- Main lesson of the day
- Next Up queue
- Weekly goal tracking
- Quick access to lesson sessions

#### Plans Tab (Learning Archive & Analytics)
- Calendar-style learning history
- KPI tiles (time learned, lessons completed, streaks)
- DayDetail screens
- Goal-setting + progress visualization
- Export/share progress (future)

#### Onboarding Flow
- Multi-step personalized onboarding
- Plan generation based on user preferences
- Progress tracking and smooth navigation

---

## Architecture & Structure

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    App.tsx                              │
│  (SafeAreaProvider, ThemeProvider, ErrorBoundary)      │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌─────────▼──────────┐
│ RootNavigator  │      │   State Store      │
│                │      │   (Zustand)        │
│ - Onboarding   │      │                    │
│ - CreatePlan   │      │ - Auth             │
│ - MainTabs     │      │ - User             │
└───────┬────────┘      │ - Plans            │
        │               │ - Lessons          │
┌───────▼────────┐      │ - Playback         │
│  TabNavigator  │      │ - UI               │
│                │      └────────────────────┘
│ - Today        │
│ - Plans        │
└────────────────┘
```

### Architecture Principles

1. **Separation of Concerns**
   - UI components are pure and presentational
   - Business logic lives in hooks and services
   - State management is centralized in Zustand slices

2. **Token-Driven Design**
   - All styling uses design tokens (no hard-coded values)
   - Theme-aware components via Restyle
   - Consistent spacing, typography, and colors

3. **Type Safety**
   - TypeScript strict mode enabled
   - Typed API responses and database schemas
   - Path aliases for clean imports

4. **Modular Structure**
   - Feature-based organization where applicable
   - Reusable UI primitives
   - Service layer for API interactions

---

## Design System & Principles

### Visual Style

- **Aesthetic:** Premium, minimal, Blinkist-inspired
- **Professional Appearance:** No emojis
- **Color Palette:**
  - Primary/Accent: Blinkist green (#00A86B)
  - Navigation: Dark teal (#1A3A52)
  - Text Hierarchy: Refined neutral grays
  - Backgrounds: Clean whites and light grays

### Design Principles

1. **Token-Driven Architecture**
   - All UI primitives use **tokens only** — no hard-coded values
   - Enforced via ESLint rule (`eslint/rules/tokens-only.js`)
   - Verified via token scanner (`scripts/check-tokens.js`)

2. **Theme System**
   - Built with **Restyle** for type-safe theming
   - Light/dark mode support
   - Synchronized with React Navigation theme

3. **Typography Hierarchy**
   - Heading1: 36px bold (screen titles)
   - Heading2: 28px bold (section headers)
   - Heading3: 20px semibold (subsection headers)
   - Heading4: 18px semibold (card titles)
   - Body: 16px regular (primary content)
   - BodySmall: 14px regular (secondary content)
   - Caption: 12px regular (metadata)

4. **Spacing Scale**
   - `xs`: 4px - Tight spacing
   - `sm`: 8px - Small gaps
   - `md`: 16px - Default gaps
   - `lg`: 24px - Large gaps, card padding
   - `xl`: 32px - Section spacing
   - `xxl`: 48px - Major section breaks
   - `xxxl`: 64px - Screen-level spacing

5. **Interaction Patterns**
   - Minimum touch targets: 48px × 48px
   - Active opacity: 0.7 on press
   - Haptic feedback on button presses
   - Smooth animations (500ms for progress, 200ms for interactions)

### UI Components

All components are documented in `DAYDIF_DESIGN_SYSTEM.md`. Key components:

- **Button:** Primary, secondary, outline, ghost variants
- **Card:** Elevated, flat, outlined, featured variants
- **Text:** Semantic color tokens with typography variants
- **Input:** Label, error states, helper text
- **ProgressBar:** Animated progress indicators
- **GoalRing:** Circular progress with SVG
- **AudioPlayer:** Playback controls with progress
- **Slider:** Custom value selection
- **Fab:** Floating action button
- **OnboardingLayout:** Consistent onboarding structure
- **OnboardingChoiceCard:** Selection cards with animations

---

## Core Development Principles

### 1. Token-Only Styling

**Rule:** Never use hard-coded colors, spacing, shadows, or font sizes.

✅ **Correct:**
```tsx
<Box padding="lg" backgroundColor="background">
  <Text variant="heading1" color="textPrimary">Title</Text>
</Box>
```

❌ **Incorrect:**
```tsx
<View style={{ padding: 24, backgroundColor: '#FFFFFF' }}>
  <Text style={{ fontSize: 36, color: '#212121' }}>Title</Text>
</View>
```

### 2. Type Safety First

- TypeScript strict mode enabled
- All functions have explicit return types
- API responses are typed
- Database schemas are typed via Supabase

### 3. Component Composition

- Build complex UIs from simple primitives
- Use Restyle's `Box`, `Text`, and layout components
- Prefer composition over configuration

### 4. Separation of Concerns

- **Screens:** Orchestration and layout
- **Hooks:** Business logic and data fetching
- **Services:** API interactions
- **Store:** Global state management
- **Components:** Reusable UI primitives

### 5. Error Handling

- Use ErrorBoundary for React errors
- Handle API errors gracefully
- Show user-friendly error messages
- Log errors for debugging

### 6. Performance

- Use `useMemo` and `useCallback` appropriately
- Lazy load screens where possible
- Optimize image loading
- Minimize re-renders

### 7. Accessibility

- Proper touch target sizes (48px minimum)
- Semantic color tokens for contrast
- Screen reader support where applicable
- Clear visual hierarchy

---

## Tech Stack

### Core Framework

- **Expo:** ~51.0.0 (React Native framework)
- **React:** 18.2.0
- **React Native:** 0.74.0
- **TypeScript:** ^5.3.0 (strict mode)

### Navigation

- **@react-navigation/native:** ^6.1.0
- **@react-navigation/native-stack:** ^6.9.0
- **@react-navigation/bottom-tabs:** ^6.5.0

### State Management

- **Zustand:** ^4.5.0 (lightweight state management)
- **@react-native-async-storage/async-storage:** 1.23.0 (persistence)

### Styling & Theming

- **@shopify/restyle:** ^2.4.0 (token-driven theming)
- **expo-linear-gradient:** ~13.0.0
- **expo-blur:** ~13.0.0

### Backend & Database

- **@supabase/supabase-js:** ^2.39.0 (backend-as-a-service)
- **expo-secure-store:** ~13.0.0 (secure storage)

### Forms & Validation

- **react-hook-form:** ^7.49.0
- **@hookform/resolvers:** ^3.3.0
- **zod:** ^3.22.0 (schema validation)

### Audio

- **expo-av:** (audio playback)
- **expo-speech:** (text-to-speech)

### Animations

- **react-native-reanimated:** ~3.10.0
- **lottie-react-native:** ^7.1.0

### Utilities

- **axios:** ^1.6.0 (HTTP client)
- **@react-native-community/netinfo:** ^11.4.1 (network status)
- **expo-haptics:** ~13.0.0 (haptic feedback)

### Testing

- **jest:** ^29.7.0
- **jest-expo:** ~51.0.0
- **@testing-library/react-native:** ^12.4.0

### Development Tools

- **ESLint:** ^8.57.0 (with custom token-only rule)
- **Prettier:** ^3.2.0 (code formatting)
- **TypeScript ESLint:** ^6.19.0

---

## Project Structure

```
DayDifv6/
├── App.tsx                          # App entry point
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config (strict mode)
├── babel.config.js                  # Babel config with path aliases
├── metro.config.js                  # Metro bundler config
├── jest.config.js                   # Jest test configuration
│
├── src/
│   ├── app/                         # App-level configuration
│   │
│   ├── components/                  # Shared components
│   │   ├── ErrorBoundary.tsx
│   │   ├── LessonPlayback.tsx
│   │   └── onboarding/
│   │       ├── CardButton.tsx
│   │       └── OptionPill.tsx
│   │
│   ├── constants/                   # App constants
│   │
│   ├── context/                     # React Context providers
│   │   └── OnboardingContext.tsx
│   │
│   ├── designSystem/                # Theme system
│   │   ├── theme.ts                 # Light theme tokens
│   │   ├── darkTheme.ts             # Dark theme tokens
│   │   ├── ThemeProvider.tsx        # Theme provider component
│   │   ├── types.ts                 # Restyle types
│   │   └── components/
│   │       └── ThemeToggle.tsx
│   │
│   ├── features/                    # Feature modules (future)
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useCalendar.ts
│   │   ├── useCreatePlan.ts
│   │   └── useTodayScreen.ts
│   │
│   ├── lib/                         # Third-party library configs
│   │   └── supabase/
│   │       ├── client.ts            # Supabase client setup
│   │       └── database.types.ts    # Generated DB types
│   │
│   ├── navigation/                  # Navigation configuration
│   │   ├── RootNavigator.tsx        # Root navigation stack
│   │   ├── TabNavigator.tsx         # Bottom tab navigator
│   │   ├── OnboardingStack.tsx      # Onboarding flow
│   │   ├── CreatePlanStack.tsx     # Plan creation flow
│   │   ├── TodayStack.tsx           # Today tab stack
│   │   ├── PlansStack.tsx           # Plans tab stack
│   │   └── types.ts                 # Navigation types
│   │
│   ├── screens/                     # Screen components
│   │   ├── TodayScreen.tsx
│   │   ├── PlansScreen.tsx
│   │   ├── CreatePlanScreen.tsx
│   │   ├── DayDetailScreen.tsx
│   │   ├── LessonDetailScreen.tsx
│   │   ├── lesson/
│   │   │   └── BuildingLessonScreen.tsx
│   │   ├── onboarding/             # Onboarding screens
│   │   │   ├── WelcomeScreen.tsx
│   │   │   ├── GoalScreen.tsx
│   │   │   ├── ChooseGoalScreen.tsx
│   │   │   └── ... (other onboarding screens)
│   │   └── today/                   # Today tab sub-screens
│   │       ├── OnboardingScreen.tsx
│   │       ├── GenerationScreen.tsx
│   │       └── ...
│   │
│   ├── services/                    # API & external services
│   │   ├── api/
│   │   │   ├── client.ts            # Axios instance
│   │   │   ├── types.ts             # API types
│   │   │   ├── userService.ts
│   │   │   ├── planService.ts
│   │   │   ├── plansService.ts
│   │   │   ├── lessonService.ts
│   │   │   ├── episodeService.ts
│   │   │   ├── profileService.ts
│   │   │   ├── progressService.ts
│   │   │   └── mocks/               # Mock data for development
│   │   │       ├── mockLessons.ts
│   │   │       ├── mockHistory.ts
│   │   │       └── mockKPIs.ts
│   │   └── audio/
│   │       ├── audioService.ts
│   │       └── ttsService.ts
│   │
│   ├── store/                       # Zustand state management
│   │   ├── index.ts                 # Store exports
│   │   ├── types.ts                 # Store types
│   │   └── slices/
│   │       ├── authSlice.ts         # Authentication state
│   │       ├── userSlice.ts         # User profile state
│   │       ├── userStateSlice.ts    # User app state (onboarding, plan)
│   │       ├── plansSlice.ts        # Plans & lessons state
│   │       ├── lessonsSlice.ts      # Lesson queue & playback
│   │       ├── playbackSlice.ts     # Audio playback state
│   │       └── uiSlice.ts           # UI state (theme, modals)
│   │
│   ├── tests/                       # Test utilities
│   │   ├── designSystem/
│   │   ├── screens/
│   │   ├── store/
│   │   ├── ui/
│   │   └── utils/
│   │
│   ├── types/                       # Shared TypeScript types
│   │
│   ├── ui/                          # UI primitives (token-only)
│   │   ├── index.ts                 # Component exports
│   │   ├── primitives.ts            # Restyle primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Text.tsx
│   │   ├── Input.tsx
│   │   ├── Slider.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── GoalRing.tsx
│   │   ├── AudioPlayer.tsx
│   │   ├── Fab.tsx
│   │   ├── Chip.tsx
│   │   ├── Avatar.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingState.tsx
│   │   ├── ScreenHeader.tsx
│   │   ├── GlassTabBar.tsx
│   │   ├── layout/                  # Layout components
│   │   │   ├── OnboardingLayout.tsx
│   │   │   └── ...
│   │   ├── onboarding/             # Onboarding-specific UI
│   │   │   └── OnboardingChoiceCard.tsx
│   │   └── hooks/
│   │       └── useIconColor.ts      # Theme-aware icon colors
│   │
│   └── utils/                       # Helper functions
│       └── index.ts
│
├── assets/                          # Static assets
│   └── lottie/
│       └── lesson-building.json
│
├── supabase/                        # Database migrations
│   ├── migrations/
│   │   ├── 000_enable_extensions.sql
│   │   ├── 001_initial_schema.sql
│   │   └── 002_storage_setup.sql
│   └── migrations-ready/
│
├── scripts/                         # Development scripts
│   ├── check-tokens.js              # Token scanner
│   ├── setup-supabase.js
│   ├── test-supabase.js
│   ├── verify-setup.js
│   └── ...
│
└── eslint/                          # ESLint configuration
    └── rules/
        └── tokens-only.js           # Custom token-only rule
```

### Path Aliases

TypeScript path aliases configured in `tsconfig.json`:

- `@/*` → `./src/*`
- `@designSystem/*` → `./src/designSystem/*`
- `@navigation/*` → `./src/navigation/*`
- `@ui/*` → `./src/ui/*`
- `@ui` → `./src/ui/index`
- `@features/*` → `./src/features/*`
- `@store/*` → `./src/store/*`
- `@store` → `./src/store/index`
- `@services/*` → `./src/services/*`
- `@types/*` → `./src/types/*`
- `@utils/*` → `./src/utils/*`
- `@constants/*` → `./src/constants/*`
- `@lib/*` → `./src/lib/*`
- `@hooks/*` → `./src/hooks/*`
- `@screens/*` → `./src/screens/*`
- `@context/*` → `./src/context/*`
- `@components/*` → `./src/components/*`

---

## State Management

### Zustand Store Architecture

DayDif uses **Zustand** for state management with multiple slices:

#### Store Slices

1. **authSlice** (`store/slices/authSlice.ts`)
   - User authentication state
   - Session management
   - Sign in/up/out actions
   - OAuth providers (Google, Apple)
   - Persisted to AsyncStorage

2. **userSlice** (`store/slices/userSlice.ts`)
   - User profile data
   - Profile updates

3. **userStateSlice** (`store/slices/userStateSlice.ts`)
   - Onboarding completion status
   - Plan existence status
   - App-level user state

4. **plansSlice** (`store/slices/plansSlice.ts`)
   - Plans data
   - Today's lesson
   - Weekly progress
   - Plan loading/refreshing

5. **lessonsSlice** (`store/slices/lessonsSlice.ts`)
   - Daily lesson
   - Next up queue
   - Lesson management

6. **playbackSlice** (`store/slices/playbackSlice.ts`)
   - Audio playback state
   - Current track
   - Playback controls

7. **uiSlice** (`store/slices/uiSlice.ts`)
   - Theme preference
   - Modal states
   - UI-level state

### Store Usage Pattern

```tsx
// In components
import { useAuthStore, usePlansStore } from '@store';

const MyComponent = () => {
  const { user, isLoading } = useAuthStore();
  const { todayLesson, loadTodayLesson } = usePlansStore();
  
  // Component logic
};
```

### Persistence

- Auth state persisted to AsyncStorage
- Only essential data persisted (user ID, not full user object)
- Sensitive data stored in SecureStore via Supabase

---

## Navigation Architecture

### Navigation Structure

```
RootNavigator (RootStack)
├── Onboarding (OnboardingStack)
│   ├── WelcomeScreen
│   ├── GoalScreen
│   ├── ChooseGoalScreen
│   └── ... (other onboarding screens)
│
├── CreatePlanFlow (CreatePlanStack)
│   └── CreatePlanScreen
│
└── MainTabs (TabNavigator)
    ├── Today (TodayStack)
    │   ├── TodayScreen
    │   ├── LessonDetailScreen
    │   └── BuildingLessonScreen
    │
    └── Plans (PlansStack)
        ├── PlansScreen
        └── DayDetailScreen
```

### Navigation Logic

The `RootNavigator` determines the initial route based on:

1. **Onboarding Status:** If not completed → `Onboarding`
2. **Plan Status:** If no plan exists → `CreatePlanFlow`
3. **Main App:** Otherwise → `MainTabs`

### Navigation Patterns

- **Stack Navigation:** Used for hierarchical flows (onboarding, detail screens)
- **Tab Navigation:** Used for main app tabs (Today, Plans)
- **Modal Navigation:** Used for overlays and modals (future)

### Theme Integration

Navigation theme is synchronized with app theme via `ThemeProvider`:

```tsx
const { navigationTheme } = useTheme();
<NavigationContainer theme={navigationTheme}>
  {/* Navigation */}
</NavigationContainer>
```

---

## Services & API Layer

### API Client

Located at `src/services/api/client.ts`:

- **Axios instance** with base URL configuration
- **Request interceptor:** Adds auth tokens (TODO)
- **Response interceptor:** Handles errors globally
- **Error handling:** Standardized error responses

### Service Structure

Each service is a module exporting functions:

```typescript
// Example: lessonService.ts
export const lessonService = {
  getLesson: async (id: string) => { /* ... */ },
  getLessonQueue: async (userId: string) => { /* ... */ },
  // ...
};
```

### Services

- **userService:** User profile operations
- **planService:** Plan creation and management
- **plansService:** Plans listing and queries
- **lessonService:** Lesson fetching and queue management
- **episodeService:** Episode operations
- **profileService:** Profile updates
- **progressService:** Progress tracking

### Mock Data

Mock services available in `src/services/api/mocks/` for development:

- `mockLessons.ts`
- `mockHistory.ts`
- `mockKPIs.ts`

### Supabase Integration

- **Client:** `src/lib/supabase/client.ts`
- **Database Types:** `src/lib/supabase/database.types.ts`
- **Storage:** SecureStore adapter for auth tokens
- **Migrations:** `supabase/migrations/`

---

## Component Patterns

### Screen Components

Screens orchestrate layout and data:

```tsx
import { useTodayScreen } from '@hooks/useTodayScreen';
import { ScreenHeader, Card, Stack } from '@ui';

export const TodayScreen = () => {
  const { greeting, todayLesson, weeklyProgress } = useTodayScreen();
  
  return (
    <Stack gap="xl">
      <ScreenHeader title="For You" />
      {/* Screen content */}
    </Stack>
  );
};
```

### Custom Hooks Pattern

Business logic extracted to hooks:

```tsx
// hooks/useTodayScreen.ts
export const useTodayScreen = (): TodayScreenData => {
  const { user } = useAuthStore();
  const { todayLesson, loadTodayLesson } = usePlansStore();
  
  useEffect(() => {
    if (user?.id) {
      loadTodayLesson(user.id);
    }
  }, [user?.id]);
  
  return { /* ... */ };
};
```

### UI Primitive Pattern

All UI components use Restyle and tokens:

```tsx
import { createBox, createText } from '@shopify/restyle';
import { Theme } from '@designSystem/theme';

const Box = createBox<Theme>();
const Text = createText<Theme>();

export const MyComponent = () => (
  <Box padding="lg" backgroundColor="background">
    <Text variant="heading1" color="textPrimary">
      Title
    </Text>
  </Box>
);
```

### Component Composition

Build complex UIs from simple primitives:

```tsx
<Card variant="elevated" padding="lg">
  <Stack gap="md">
    <Text variant="heading4">Card Title</Text>
    <Text variant="body" color="textSecondary">
      Card content
    </Text>
    <Button variant="primary" onPress={handlePress}>
      Action
    </Button>
  </Stack>
</Card>
```

---

## Testing Strategy

### Testing Tools

- **Jest:** Test runner
- **React Native Testing Library:** Component testing
- **jest-expo:** Expo-specific test utilities

### Test Structure

Tests mirror source structure:

```
src/
├── components/
│   └── __tests__/
├── screens/
│   └── __tests__/
├── store/
│   └── __tests__/
└── ui/
    └── __tests__/
```

### Test Patterns

1. **Component Tests:** Test UI components in isolation
2. **Hook Tests:** Test custom hooks with `@testing-library/react-hooks`
3. **Store Tests:** Test Zustand slices
4. **Integration Tests:** Test screen flows

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

---

## Quality Gates

### Pre-Commit Checks

All code must pass:

1. **Type Checking:** `npm run typecheck`
   - TypeScript strict mode
   - No type errors

2. **Linting:** `npm run lint`
   - ESLint with token-only rule
   - No hard-coded style values

3. **Token Scanner:** `npm run tokens:scan`
   - Custom token validation
   - Ensures token usage

4. **Tests:** `npm test`
   - All tests passing
   - Coverage thresholds (if configured)

### Quality Standards

- ✅ **Type Safety:** All code is typed
- ✅ **Token Usage:** No hard-coded styles
- ✅ **Component Tests:** Critical components tested
- ✅ **Error Handling:** Graceful error handling
- ✅ **Performance:** Optimized renders
- ✅ **Accessibility:** Proper touch targets and contrast

---

## Development Workflow

### Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   - Copy `.env.example` to `.env`
   - Add Supabase credentials
   - See `COMPLETE_SETUP_SUMMARY.md` for details

3. **Start Development Server:**
   ```bash
   npm start
   ```

4. **Run on Device:**
   ```bash
   npm run ios      # iOS
   npm run android  # Android
   ```

### Development Commands

```bash
# Development
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator

# Quality Checks
npm run lint           # Run ESLint
npm run typecheck      # TypeScript type checking
npm run tokens:scan    # Token scanner

# Testing
npm test               # Run tests
npm run test:watch     # Watch mode

# Supabase
npm run setup:supabase # Setup Supabase
npm run test:supabase  # Test Supabase connection
npm run verify:supabase # Verify setup
```

### Code Review Checklist

Before submitting code:

- [ ] All tests passing
- [ ] TypeScript compiles without errors
- [ ] ESLint passes (no token violations)
- [ ] Token scanner passes
- [ ] No hard-coded style values
- [ ] Error handling implemented
- [ ] Components use design tokens
- [ ] Navigation works correctly
- [ ] State management follows patterns
- [ ] Code follows style guide

---

## Code Style & Standards

### TypeScript

- **Strict Mode:** Enabled
- **No `any`:** Use proper types
- **Explicit Returns:** Functions have return types
- **Interfaces:** Prefer interfaces over types for objects

### Naming Conventions

- **Components:** PascalCase (`TodayScreen`, `CardButton`)
- **Hooks:** camelCase with `use` prefix (`useTodayScreen`)
- **Services:** camelCase (`lessonService`, `userService`)
- **Store Slices:** camelCase with `Slice` suffix (`authSlice`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Files:** Match export name (`TodayScreen.tsx` exports `TodayScreen`)

### Import Organization

1. React and React Native imports
2. Third-party library imports
3. Internal imports (grouped by type)
4. Type imports (with `type` keyword)

```tsx
import React from 'react';
import { View } from 'react-native';

import { useAuthStore } from '@store';
import { lessonService } from '@services/api/lessonService';

import type { Lesson } from '@types';
```

### Component Structure

```tsx
// 1. Imports
import React from 'react';
// ...

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Component
export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // 4. Hooks
  const { theme } = useTheme();
  
  // 5. State
  const [state, setState] = useState();
  
  // 6. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 7. Handlers
  const handlePress = () => {
    // ...
  };
  
  // 8. Render
  return (
    // JSX
  );
};
```

### File Organization

- **One component per file**
- **Co-locate related files** (component + test + types)
- **Index files** for clean exports
- **Barrel exports** for related components

---

## Additional Resources

### Documentation Files

- **DAYDIF_DESIGN_SYSTEM.md:** Complete design system reference
- **DAYDIF_CONTEXT_DOCUMENT.md:** Product context and features
- **COMPLETE_SETUP_SUMMARY.md:** Setup instructions
- **SUPABASE_SETUP.md:** Supabase configuration guide
- **QUICK_START_GUIDE.md:** Quick start instructions

### External Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Restyle Documentation](https://github.com/Shopify/restyle)
- [Supabase Documentation](https://supabase.com/docs)

---

## Version History

- **v1.0** (2024): Initial master development guide

---

**This document is the source of truth for DayDif development. Keep it updated as the project evolves.**

