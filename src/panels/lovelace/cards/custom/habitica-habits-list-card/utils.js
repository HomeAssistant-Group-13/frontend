/**
 * Utility functions for Habitica Habits List Card
 */

/**
 * Get Habitica class based on value
 */
export function getHabiticaClass(value) {
  const numValue = parseFloat(value);
  if (numValue >= 10) return "best";
  if (numValue >= 1) return "better";
  if (numValue >= -1) return "neutral";
  if (numValue >= -10) return "worse";
  return "worst";
}

/**
 * Get value color based on value
 */
export function getValueColor(value) {
  const numValue = parseFloat(value);
  if (numValue >= 10) return "#4f2a93"; // Purple
  if (numValue >= 1) return "#3b76dd"; // Blue
  if (numValue >= -1) return "#ffbe5d"; // Yellow
  if (numValue >= -10) return "#f74e52"; // Orange
  return "#c42c2f"; // Red
}

/**
 * Sort habits based on configuration
 */
export function sortHabits(habits, sortBy, sortDirection) {
  const sorted = [...habits];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "frequency": {
        const freqOrder = { daily: 1, weekly: 2, monthly: 3 };
        comparison =
          (freqOrder[a.frequency] || 0) - (freqOrder[b.frequency] || 0);
        break;
      }
      case "value":
      default:
        comparison = a.value - b.value;
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Parse habits from Home Assistant states
 */
export function parseHabitsFromStates(hass, filter = "all") {
  if (!hass) return [];

  // Find all habit sensors
  const habitSensors = Object.keys(hass.states)
    .filter((entity_id) => {
      const state = hass.states[entity_id];
      return (
        entity_id.startsWith("sensor.") &&
        state.attributes.habit_id &&
        state.attributes.text
      );
    })
    .map((entity_id) => ({
      entity_id,
      state: hass.states[entity_id],
      name:
        hass.states[entity_id].attributes.text ||
        hass.states[entity_id].attributes.friendly_name,
      value: parseFloat(hass.states[entity_id].state) || 0,
      frequency: hass.states[entity_id].attributes.frequency || "daily",
      counter_up: hass.states[entity_id].attributes.counter_up || 0,
      counter_down: hass.states[entity_id].attributes.counter_down || 0,
      notes: hass.states[entity_id].attributes.notes || "",
      habit_id: hass.states[entity_id].attributes.habit_id,
    }));

  // Filter by frequency if needed
  if (filter !== "all") {
    return habitSensors.filter((h) => h.frequency === filter);
  }

  return habitSensors;
}

/**
 * Get motivational message from states
 */
export function getMotivation(hass) {
  if (!hass) return null;

  const motivationSensor = Object.keys(hass.states).find(
    (id) =>
      id.includes("daily_motivation") || id.includes("motivational_prompt")
  );

  return motivationSensor ? hass.states[motivationSensor].state : null;
}

/**
 * Get frequency counts from states
 */
export function getFrequencyCounts(hass) {
  if (!hass) return { daily: 0, weekly: 0, monthly: 0 };

  return {
    daily: hass.states["sensor.habits_daily"]?.state || 0,
    weekly: hass.states["sensor.habits_weekly"]?.state || 0,
    monthly: hass.states["sensor.habits_monthly"]?.state || 0,
  };
}
