# DayDif iOS App

A commute-focused AI learning app designed to turn wasted travel time into structured, meaningful daily learning.

**Core Value Proposition:** Distinct Days. Stronger Mind.

## Tech Stack

- **Expo** (latest)
- **React Navigation v7**
- **Zustand** for state management
- **Axios** for networking
- **React Hook Form** + Zod for forms
- **Restyle** for token-driven theming
- **Jest** + React Native Testing Library
- **TypeScript** (strict mode)

## Project Structure

```
src/
  ├─ app/                    # App entry point
  ├─ designSystem/          # Theme system (Restyle)
  ├─ ui/                     # UI primitives (token-only)
  ├─ features/              # Feature modules
  ├─ store/                 # Zustand slices
  ├─ services/              # API & external services
  ├─ types/                 # Shared TypeScript types
  ├─ utils/                 # Helper functions
  ├─ constants/             # App constants
  ├─ navigation/            # React Navigation setup
  ├─ screens/               # Screen components
  └─ components/            # Shared components
```

## Design System

The app uses a **token-driven design system** with:
- Blinkist-inspired premium aesthetic
- Light/dark theme support
- No hard-coded style values
- Strict ESLint rules to enforce token usage

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on iOS:
```bash
npm run ios
```

## Quality Gates

- `npm run lint` - ESLint with token-only enforcement
- `npm run typecheck` - TypeScript strict mode checking
- `npm run tokens:scan` - Custom token scanner
- `npm test` - Jest test suite

## Features

### Today Tab
- Daily greeting
- Main lesson of the day
- Next Up queue
- Weekly goal tracking
- Avatar personalization

### Plans Tab
- Calendar-style learning history
- KPI tiles (time learned, lessons completed, streaks)
- DayDetail screens
- Goal-setting + progress visualization

## Mock Data

The app uses mock data by default. Set `EXPO_PUBLIC_USE_MOCK_DATA=false` to use real API endpoints.

## Testing

Run tests with:
```bash
npm test
```

Watch mode:
```bash
npm run test:watch
```

## License

Private project

