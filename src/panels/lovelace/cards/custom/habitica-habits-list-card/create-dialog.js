/**
 * Create habit dialog for Habitica Habits List Card
 */

/**
 * Render the create habit dialog
 */
export function renderCreateDialog() {
  return `
    <div class="dialog-overlay" onclick="if(event.target === this) this.getRootNode().host.closeCreateDialog()">
      <div class="dialog">
        <div class="dialog-header">
          <h3 class="dialog-title">Create New Habit</h3>
          <button class="dialog-close" onclick="this.getRootNode().host.closeCreateDialog()" aria-label="Close">
            ×
          </button>
        </div>

        <div class="dialog-body">
          <form id="create-habit-form" onsubmit="event.preventDefault(); this.getRootNode().host.handleCreateHabit(event)">
            <div class="form-group">
              <label class="form-label" for="habit-name">
                Habit Name <span style="color: var(--error-color)">*</span>
              </label>
              <input 
                type="text" 
                id="habit-name" 
                name="name" 
                class="form-input" 
                placeholder="e.g., Exercise, Meditate, Drink Water"
                required
                autofocus
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="habit-notes">
                Notes (Optional)
              </label>
              <textarea 
                id="habit-notes" 
                name="notes" 
                class="form-input form-textarea" 
                placeholder="Details about your habit..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Scoring Options</label>
              <div class="form-checkboxes">
                <label class="checkbox-label">
                  <input type="checkbox" name="up" id="checkbox-up" checked />
                  <div class="checkbox-wrapper">
                    <span class="checkbox-icon">+</span>
                  </div>
                  <span class="checkbox-text">Positive</span>
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" name="down" id="checkbox-down" checked />
                  <div class="checkbox-wrapper">
                    <span class="checkbox-icon">−</span>
                  </div>
                  <span class="checkbox-text">Negative</span>
                </label>
              </div>
            </div>

            <div class="dialog-actions">
              <button type="button" class="dialog-button dialog-button-cancel" onclick="this.getRootNode().host.closeCreateDialog()">
                Cancel
              </button>
              <button type="submit" class="dialog-button dialog-button-submit">
                Create Habit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

/**
 * Handle creating a new habit
 */
export async function handleCreateHabitSubmit(hass, shadowRoot) {
  const form = shadowRoot.querySelector("#create-habit-form");
  const formData = new FormData(form);

  const name = formData.get("name");
  const notes = formData.get("notes");
  const up = formData.get("up") === "on";
  const down = formData.get("down") === "on";

  if (!name) {
    throw new Error("Habit name is required");
  }

  // Get config_entry_id from any existing habit sensor
  let configEntryId = null;
  const firstHabit = Object.values(hass.states).find(
    (state) =>
      state.entity_id.startsWith("sensor.") && state.attributes.habit_id
  );

  if (firstHabit && firstHabit.attributes.entry_id) {
    configEntryId = firstHabit.attributes.entry_id;
  }

  if (!configEntryId) {
    throw new Error(
      "Could not find Habitica integration. Please restart Home Assistant and ensure you have at least one habit configured."
    );
  }

  const serviceData = {
    config_entry: configEntryId,
    name: name,
  };

  if (notes) {
    serviceData.notes = notes;
  }

  // Build up_down array
  const upDown = [];
  if (up) upDown.push("up");
  if (down) upDown.push("down");
  if (upDown.length > 0) {
    serviceData.up_down = upDown;
  }

  await hass.callWS({
    type: "call_service",
    domain: "habitica",
    service: "create_habit",
    service_data: serviceData,
    return_response: true,
  });

  return name;
}
