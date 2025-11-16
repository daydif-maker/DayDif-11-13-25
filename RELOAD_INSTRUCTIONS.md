# How to See the Cal AI Changes in Expo Go

The changes have been implemented but you need to reload the app to see them:

## Steps:

1. **Stop the current Expo server** (if running)
   - Press `Ctrl+C` in the terminal where Expo is running

2. **Clear Metro bundler cache and restart:**
   ```bash
   npx expo start --clear
   ```

3. **In Expo Go app:**
   - Shake your device (or press `Cmd+D` on iOS simulator / `Cmd+M` on Android)
   - Tap "Reload" or press `r` in the terminal

4. **If changes still don't appear:**
   - Close Expo Go completely
   - Restart Expo Go
   - Scan the QR code again

## What to Look For:

- **Today Screen:**
  - Subtle gradient background
  - Weekly progress ring in greeting section (if you have progress)
  - Daily lesson card with 60/40 split layout
  - Duration chips in Next Up section
  - Full-width pill-shaped primary buttons

- **Plans Screen:**
  - KPI tiles with circular progress rings
  - Rounded pill calendar days

- **Onboarding:**
  - Duration chips (15, 30, 60, 90 mins)
  - Frequency chips (3, 5, 7 days)

## Troubleshooting:

If you see errors, check the terminal output for:
- SVG-related errors (GoalRing component)
- Animation errors (Card component)
- Import errors

If errors persist, try:
```bash
rm -rf node_modules
npm install
npx expo start --clear
```
