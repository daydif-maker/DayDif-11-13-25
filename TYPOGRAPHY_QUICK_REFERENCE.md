# DM Sans Typography Quick Reference

## Text Variants Usage Guide

### Headers & Titles

#### `heading1` - Main Hero Titles
```tsx
<Text variant="heading1">Welcome to DayDif</Text>
```
- Font: **DM Sans Bold (700)**
- Size: 36px
- Use for: Splash screens, major section titles

#### `heading2` - Section Titles
```tsx
<Text variant="heading2">The Art of Stoic Focus</Text>
```
- Font: **DM Sans Bold (700)**
- Size: 28px
- Use for: Lesson titles, card headers

#### `heading3` - Sub-section Titles
```tsx
<Text variant="heading3">Good Morning, Alex</Text>
```
- Font: **DM Sans Medium (500)**
- Size: 20px
- Use for: Greetings, sub-section headers

#### `heading4` - Minor Headers
```tsx
<Text variant="heading4">Recent Activity</Text>
```
- Font: **DM Sans Medium (500)**
- Size: 18px
- Use for: Card section titles, minor headers

---

### Body Text

#### `body` - Standard Body Text
```tsx
<Text variant="body">12 min listen</Text>
```
- Font: **DM Sans Regular (400)**
- Size: 16px
- Use for: Standard paragraph text, descriptions

#### `bodyMedium` - Emphasized Body Text
```tsx
<Text variant="bodyMedium">Mindful Productivity</Text>
```
- Font: **DM Sans Medium (500)**
- Size: 16px
- Use for: List item titles, emphasized content

#### `bodySmall` - Small Body Text
```tsx
<Text variant="bodySmall">Last updated 2 hours ago</Text>
```
- Font: **DM Sans Regular (400)**
- Size: 14px
- Use for: Secondary information, metadata

---

### Labels & Captions

#### `label` - Uppercase Section Labels
```tsx
<Text variant="label" color="success">LESSON OF THE DAY</Text>
```
- Font: **DM Sans Bold (700)**
- Size: 12px
- Letter Spacing: **Wide (1.5)**
- Use for: Uppercase section labels, category tags

#### `caption` - Small Captions
```tsx
<Text variant="caption">5 lessons completed</Text>
```
- Font: **DM Sans Regular (400)**
- Size: 12px
- Use for: Captions, small metadata, timestamps

---

### Metrics

#### `metric` - Large Numbers & Stats
```tsx
<Text variant="metric">3/5</Text>
```
- Font: **DM Sans Bold (700)**
- Size: 32px
- Use for: Large numbers, statistics, progress indicators

---

## Inline Font Weight Overrides

When you need to override font weight inline, the Text component automatically handles it:

```tsx
<Text variant="body" fontWeight="700">Bold Text</Text>
<Text variant="body" fontWeight="500">Medium Text</Text>
<Text variant="body" fontWeight="400">Regular Text</Text>
```

### Weight Mapping:
- `400` or `normal` → DM Sans Regular
- `500` or `600` → DM Sans Medium (600 maps to 500)
- `700`, `800`, `900`, or `bold` → DM Sans Bold

---

## Common Patterns

### Greeting Header
```tsx
<Text variant="heading3">Good Morning, {userName}</Text>
```

### Section Label + Title
```tsx
<Text variant="label" color="success">LESSON OF THE DAY</Text>
<Text variant="heading2">{lessonTitle}</Text>
```

### List Item
```tsx
<Text variant="bodyMedium">{itemTitle}</Text>
<Text variant="caption" color="success">{metadata}</Text>
```

### Stats Display
```tsx
<Text variant="metric">{value}</Text>
<Text variant="caption">{description}</Text>
```

---

## Design System Colors

Commonly used text colors:
- `textPrimary` - Main text (default)
- `textSecondary` - Secondary text, less emphasis
- `textTertiary` - Tertiary text, minimal emphasis
- `success` - Accent color (emerald green #00BFA5)

```tsx
<Text variant="body" color="textSecondary">Secondary text</Text>
<Text variant="label" color="success">LABEL</Text>
```

---

## Pro Tips

1. **Use semantic variants** instead of inline styles when possible
2. **The `label` variant** is perfect for uppercase section headers with proper letter spacing
3. **The `bodyMedium` variant** replaces the need for `fontWeight="600"` on body text
4. **Font weight overrides** are automatically handled - no need to manually change fontFamily
5. **All fonts inherit from the theme** - both light and dark modes use DM Sans

---

## Migration Examples

### Before
```tsx
<Text variant="caption" fontWeight="700" style={{ letterSpacing: 2 }}>
  LESSON OF THE DAY
</Text>
```

### After
```tsx
<Text variant="label" color="success">
  LESSON OF THE DAY
</Text>
```

---

### Before
```tsx
<Text variant="body" fontWeight="600">{title}</Text>
```

### After
```tsx
<Text variant="bodyMedium">{title}</Text>
```

---

## Testing

Run the app and verify:
```bash
npm start
# or with cache clear
expo start -c
```

Check these key elements:
- [ ] "Good Morning, [Name]" uses medium weight
- [ ] "LESSON OF THE DAY" is bold with wide spacing
- [ ] Hero lesson titles are bold
- [ ] List item titles are medium weight
- [ ] All text renders in DM Sans font family

