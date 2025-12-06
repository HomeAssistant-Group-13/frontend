# Habitica Habits List Card

Standalone custom Lovelace card for displaying all your Habitica habits with Habitica-style UI.

## Overview

This is a **standalone custom card** that doesn't require building the entire Home Assistant frontend. It's designed to be used as a community/custom card that users can add to their Home Assistant installation.

## Files

- `habitica-habits-list-card.js` - Complete habits list card (auto-discovers all habits with full features)

## Installation for Users

### Method 1: Manual Installation

1. Copy the file to your Home Assistant `config/www/` directory:
   - `habitica-habits-list-card.js`

2. Add resource in Home Assistant:
   - Settings → Dashboards → Resources → Add Resource
   - Add `/local/habitica-habits-list-card.js` (JavaScript Module)

3. Add card to dashboard:
   ```yaml
   type: custom:habitica-habits-list-card
   title: My Habitica Habits
   ```

### Method 2: HACS (Future)

This card could be packaged for HACS (Home Assistant Community Store) for easier installation.

## Features

- **Habitica-style UI** with color-coded buttons based on frequency
- **Instant feedback** on button presses with +/− buttons
- **Optimistic updates** from backend integration
- **Auto-discovery** of all habit sensors
- **Filtering** by frequency (daily, weekly, monthly)
- **Sorting** by value, name, or frequency
- **Statistics** showing counts by frequency
- **Motivational messages** from your daily motivation sensor
- **Create new habits** directly from the card
- **Scrollable list** with efficient rendering

## Configuration

```yaml
type: custom:habitica-habits-list-card
title: My Habitica Habits # Optional (default: "My Habitica Habits")
show_filter: true # Optional (default: true) - Show filter buttons
filter: all # Optional (default: "all") - all, daily, weekly, monthly
sort_by: value # Optional (default: "value") - value, name, frequency
sort_direction: desc # Optional (default: "desc") - asc, desc
show_empty: true # Optional (default: true) - Show empty state
```

**How it works:**

- Automatically discovers all habit sensors from your Habitica integration
- Shows statistics by frequency type (daily/weekly/monthly)
- Displays motivational message if available
- Filter and sort habits your way
- Click habits to see more details
- Use +/− buttons for instant scoring
- Create new habits with the built-in dialog

## Color Scheme

The card uses color-coded buttons based on habit frequency:

- **Green** - Daily habits
- **Blue** - Weekly habits
- **Purple** - Monthly habits

Values are also color-coded by frequency for visual consistency.

## Development

### Why Standalone?

This card is implemented as a standalone JavaScript file rather than a built-in TypeScript component because:

1. **Easier distribution** - Users can install without rebuilding frontend
2. **Faster development** - No build process needed
3. **HACS compatible** - Can be distributed through community store
4. **No dependencies** - Works with any Home Assistant version

### Modifying the Card

1. Edit `habitica-habits-list-card.js`
2. Copy to `config/www/` in your test instance
3. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R) to see changes
4. No build process required!

## Backend Integration

This card works with the Habitica integration backend:

- **Sensors**: `sensor.{habit_name}` - Individual habit sensors
- **Buttons**: `button.{habit_name}_up/down` - Score buttons
- **Optimistic Updates**: Backend provides instant UI feedback

See `homeassistant/components/habitica/HABITS_FEATURE.md` for backend documentation.

## Future Enhancements

- [ ] Package for HACS distribution
- [ ] Add progress bar visualization
- [ ] Add habit history graph
- [ ] Add streak counter display
- [ ] Add confetti animation for milestones
- [ ] Add sound effects (optional)

## License

Apache 2.0 (Home Assistant)
