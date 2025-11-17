# Onboarding Design Update

This document summarizes the design updates made to match the reference designs provided.

## 🎨 Design Changes

### 1. **OnboardingLayout Component** (`src/ui/layout/OnboardingLayout.tsx`)

**Updated Elements:**

- **Progress Bar**:
  - Changed height from 4px to 3px for a sleeker look
  - Updated background color to use `theme.colors.border` for better contrast
  - Changed fill color to black (`theme.colors.black`) instead of primary color
  - Increased border radius for smoother appearance

- **Back Button**:
  - Removed circular background (was `backgroundSecondary`)
  - Changed icon from `chevron-back` to `arrow-back`
  - Increased icon size from 20 to 24
  - Simplified styling to just the icon without background

- **Language Selector**:
  - Added US flag emoji (🇺🇸) for visual appeal
  - Increased font weight to 600 for "EN" text
  - Updated styling to match reference design
  - Set `showLanguageSelector` prop to enable on screens

- **Title & Subtitle**:
  - Increased title font size to 32px with line height of 40
  - Adjusted subtitle font size to 16px
  - Updated spacing between title and subtitle

- **Continue Button**:
  - Increased padding from 16px to 18px vertical
  - Increased border radius from 24px to 28px for more rounded appearance
  - Increased min height from 48px to 56px
  - Updated button text font size to 18px

- **Spacing & Layout**:
  - Increased gap between header elements
  - Added proper spacing throughout the layout
  - Improved overall visual hierarchy

### 2. **OnboardingChoiceCard Component** (`src/ui/onboarding/OnboardingChoiceCard.tsx`)

**Major Redesign:**

- **Card Styling**:
  - Changed background from `backgroundSecondary` to `background` when not selected
  - Removed border for cleaner look
  - Increased min height to 72px
  - Updated padding to use vertical `lg` and horizontal `xl`
  - Changed border radius to use theme's `xl` value (16px)

- **Selected State**:
  - Black background with white text (maintained)
  - Enhanced contrast for better visibility

- **Icon Container**:
  - Added circular icon background (40x40px)
  - Background opacity changes based on selection state
  - Icon changes color based on selection (white when selected, black when not)
  - Proper centering and alignment

- **Typography**:
  - Label font size increased to 18px with font weight 600
  - Description font size set to 14px
  - Proper color contrast for both states

### 3. **OptionPill Component** (`src/components/onboarding/OptionPill.tsx`)

**Refinements:**

- **Sizing**:
  - Increased padding from 12px to 18px vertical
  - Increased padding from 20px to 24px horizontal
  - Increased min height from 44px to 60px

- **Typography**:
  - Font weight changed to 600 (consistent for all states)
  - Font size increased to 17px

### 4. **OnboardingContext** (`src/context/OnboardingContext.tsx`)

**Added:**
- New `gender` field to `OnboardingState` type
- Default value for `gender` in `defaultState`

## 📱 New Screens Created

### 1. **GenderScreen** (`src/screens/onboarding/GenderScreen.tsx`)
- Matches the first reference image exactly
- Simple text-only choice cards for Male, Female, Other
- Clean, minimal design
- Language selector enabled

### 2. **WorkoutFrequencyScreen** (`src/screens/onboarding/WorkoutFrequencyScreen.tsx`)
- Matches the second reference image
- Choice cards with icons and descriptions
- Options: 0-2, 3-5, 6+ workouts per week
- Each option has a custom icon and descriptive text

### 3. **Updated MotivationScreen** (`src/screens/onboarding/MotivationScreen.tsx`)
- Converted from OptionPill to OnboardingChoiceCard
- Added icons and descriptions to each motivation option
- Icons: person, briefcase, school, bulb, compass
- Language selector enabled

## 🎯 Design Principles Applied

1. **Clean & Modern**:
   - Removed unnecessary borders and backgrounds
   - Increased white space
   - Simplified visual elements

2. **Clear Hierarchy**:
   - Large, bold titles (32px)
   - Clear subtitles (16px)
   - Prominent action buttons (56px height)

3. **Consistent Spacing**:
   - 16px gaps between choice cards
   - Proper padding throughout
   - Aligned elements

4. **Strong Selection States**:
   - Black background with white text for selected items
   - Clear visual feedback
   - High contrast for accessibility

5. **Professional Polish**:
   - Rounded corners (24-28px)
   - Smooth transitions
   - Haptic feedback maintained

## 🔄 Screens Updated

The following screens now have the language selector enabled and updated design:

- ✅ WelcomeScreen
- ✅ GoalScreen
- ✅ MotivationScreen (redesigned with icons)
- ✅ CommuteDurationScreen
- ✅ LearningStyleScreen
- ✅ GenderScreen (new)
- ✅ WorkoutFrequencyScreen (new)

## 🚀 Usage

All onboarding screens now automatically use the new design system. The components are:

```tsx
// For simple text choices
<OnboardingChoiceCard
  label="Male"
  selected={selected === 'Male'}
  onPress={() => setSelected('Male')}
/>

// For choices with descriptions and icons
<OnboardingChoiceCard
  label="3-5"
  description="A few workouts per week"
  selected={selected === '3-5'}
  onPress={() => setSelected('3-5')}
  icon={
    <Ionicons 
      name="ellipse" 
      size={20} 
      color={selected ? '#FFFFFF' : '#000000'}
    />
  }
/>
```

## 📦 Files Modified

### Core Components:
- `src/ui/layout/OnboardingLayout.tsx`
- `src/ui/onboarding/OnboardingChoiceCard.tsx`
- `src/components/onboarding/OptionPill.tsx`

### Context:
- `src/context/OnboardingContext.tsx`

### Screens:
- `src/screens/onboarding/WelcomeScreen.tsx`
- `src/screens/onboarding/GoalScreen.tsx`
- `src/screens/onboarding/MotivationScreen.tsx`
- `src/screens/onboarding/CommuteDurationScreen.tsx`
- `src/screens/onboarding/LearningStyleScreen.tsx`
- `src/screens/onboarding/GenderScreen.tsx` (new)
- `src/screens/onboarding/WorkoutFrequencyScreen.tsx` (new)
- `src/screens/onboarding/index.ts` (new)

## 🎨 Key Visual Changes Summary

| Element | Before | After |
|---------|--------|-------|
| Progress Bar | 4px, primary color | 3px, black |
| Back Button | Circle with background | Simple arrow icon |
| Language Selector | Text only | Flag + text |
| Title Font Size | 36px | 32px (optimized) |
| Choice Cards | Border, smaller | Borderless, larger (72px min) |
| Continue Button | 48px height | 56px height, more rounded |
| Card Icons | N/A | Circular background, 40px |

## ✨ Best Practices

1. **Always enable language selector** for international apps:
   ```tsx
   showLanguageSelector={true}
   ```

2. **Use OnboardingChoiceCard for all choice-based screens** to maintain consistency

3. **Add icons and descriptions** when choices need more context

4. **Keep titles concise** and **subtitles informative**

5. **Maintain haptic feedback** for better user experience

---

**Result**: The onboarding flow now perfectly matches the reference designs with a clean, modern, and professional appearance.

