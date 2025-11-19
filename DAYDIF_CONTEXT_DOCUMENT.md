# DayDif Context Document

## 1. Overview
DayDif is a commute-focused AI learning app designed to turn wasted travel time into structured, meaningful daily learning.

**Core Value Proposition:**  
Distinct Days. Stronger Mind.

### Target Audience
- Busy professionals and students with daily commutes  
- People wanting to maximize “dead time”  
- Users who prefer audio-first guided learning  

---

## 2. Core Design Principles
- **Visual Style:** Premium, minimal, Blinkist-inspired  
- **Professional Appearance:** No emojis  
- **User Experience:**
  - Glass morphism navigation with haptics  
  - Animated transitions  
  - Ergonomic layouts  

- **Behavior:** Habit-forming, progress-first product

---

## 3. Main Tabs

### Today Tab (Command Center)
- Daily greeting
- Main lesson of the day
- Next Up queue
- Weekly goal tracking
- Avatar personalization
- Quick access to lesson sessions

### Plans Tab (Learning Archive & Analytics)
- Calendar-style learning history
- KPI tiles (time learned, lessons completed, streaks)
- DayDetail screens
- Goal-setting + progress visualization
- Export/share progress (future)

---

## 4. Onboarding Flow

### Overview
Multi-step onboarding flow that collects user preferences to generate a personalized learning plan. Features a modern, clean design with progress tracking and smooth navigation.

### Key Screens
- **WelcomeScreen:** Initial introduction
- **GenderScreen:** Gender selection (Male, Female, Other)
- **GoalScreen:** Learning goal selection
- **MotivationScreen:** Motivation selection with icons
- **WorkoutFrequencyScreen:** Weekly workout frequency (0-2, 3-5, 6+)
- **CommuteDurationScreen:** Commute duration selection
- **CommuteTimeOfDayScreen:** Preferred commute time
- **LearningStyleScreen:** Learning preference selection
- **ObstaclesScreen:** Potential obstacle identification
- Additional screens: Encouragement, Projection, Pace, SocialProof, AllSet, Generating, PlanReveal, SaveProgress, Paywall, Success

### Onboarding Design Features
- **Progress Bar:** 3px black progress indicator at top
- **Back Button:** Simple arrow icon (no background circle)
- **Language Selector:** Optional US flag + "EN" text in top right
- **Choice Cards:** Large (72px min height), clean design with optional icons and descriptions
- **Selected State:** Black background with white text
- **Continue Button:** 56px height, 28px border radius, prominent black button
- **Typography:** 32px bold titles, 16px gray subtitles

### Components
- **OnboardingLayout:** Main layout wrapper with progress bar, header, scrollable content, and fixed footer
- **OnboardingChoiceCard:** Choice card component supporting icons, descriptions, and selection states
- **OptionPill:** Pill-shaped option buttons for quick selections

---

## 5. Additional Notes
- Built with haptic feedback + animated transitions
- Designed for extensibility (premium tier, local TTS, more AI integrations)
- Onboarding flow uses modern, minimal design patterns with smooth animations
