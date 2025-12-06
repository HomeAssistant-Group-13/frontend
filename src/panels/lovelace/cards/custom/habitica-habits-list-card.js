/**
 * Habitica Habits List Card
 *
 * Automatically displays all Habitica habits in a scrollable list
 * Each habit shows with score up/down buttons
 */

class HabiticaHabitsListCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._habits = [];
    this._filter = "all"; // all, daily, weekly, monthly
    this._showCreateDialog = false;
    this._scrollPosition = 0;
    this._motivation = null;
    this._dailyCount = 0;
    this._weeklyCount = 0;
    this._monthlyCount = 0;
  }

  setConfig(config) {
    this.config = {
      title: config.title || "My Habitica Habits",
      show_filter: config.show_filter !== false,
      show_empty: config.show_empty !== false,
      filter: config.filter || "all", // all, daily, weekly, monthly
      sort_by: config.sort_by || "value", // value, name, frequency
      sort_direction: config.sort_direction || "desc", // asc, desc
      ...config,
    };

    this._filter = this.config.filter;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.updateHabits();
    this.render();
  }

  updateHabits() {
    if (!this._hass) return;

    // Get motivational message
    const motivationSensor = Object.keys(this._hass.states).find(
      (id) =>
        id.includes("daily_motivation") || id.includes("motivational_prompt")
    );
    this._motivation = motivationSensor
      ? this._hass.states[motivationSensor].state
      : null;

    // Get frequency stats
    this._dailyCount = this._hass.states["sensor.habits_daily"]?.state || 0;
    this._weeklyCount = this._hass.states["sensor.habits_weekly"]?.state || 0;
    this._monthlyCount = this._hass.states["sensor.habits_monthly"]?.state || 0;

    // Find all habit sensors
    const habitSensors = Object.keys(this._hass.states)
      .filter((entity_id) => {
        const state = this._hass.states[entity_id];
        return (
          entity_id.startsWith("sensor.") &&
          state.attributes.habit_id &&
          state.attributes.text
        );
      })
      .map((entity_id) => ({
        entity_id,
        state: this._hass.states[entity_id],
        name:
          this._hass.states[entity_id].attributes.text ||
          this._hass.states[entity_id].attributes.friendly_name,
        value: parseFloat(this._hass.states[entity_id].state) || 0,
        frequency: this._hass.states[entity_id].attributes.frequency || "daily",
        counter_up: this._hass.states[entity_id].attributes.counter_up || 0,
        counter_down: this._hass.states[entity_id].attributes.counter_down || 0,
        notes: this._hass.states[entity_id].attributes.notes || "",
        habit_id: this._hass.states[entity_id].attributes.habit_id,
      }));

    // Filter by frequency if needed
    if (this._filter !== "all") {
      this._habits = habitSensors.filter((h) => h.frequency === this._filter);
    } else {
      this._habits = habitSensors;
    }

    // Sort habits
    this._habits.sort((a, b) => {
      let comparison = 0;

      switch (this.config.sort_by) {
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

      return this.config.sort_direction === "asc" ? comparison : -comparison;
    });
  }

  getHabiticaClass(value) {
    const numValue = parseFloat(value);
    if (numValue >= 10) return "best";
    if (numValue >= 1) return "better";
    if (numValue >= -1) return "neutral";
    if (numValue >= -10) return "worse";
    return "worst";
  }

  getValueColor(value) {
    const numValue = parseFloat(value);
    if (numValue >= 10) return "#4f2a93"; // Purple
    if (numValue >= 1) return "#3b76dd"; // Blue
    if (numValue >= -1) return "#ffbe5d"; // Yellow
    if (numValue >= -10) return "#f74e52"; // Orange
    return "#c42c2f"; // Red
  }

  handleScoreUp(_habitId, entityId) {
    const buttonEntity = `button.${entityId.split(".")[1]}_up`;
    this._hass.callService("button", "press", {
      entity_id: buttonEntity,
    });
  }

  handleScoreDown(_habitId, entityId) {
    const buttonEntity = `button.${entityId.split(".")[1]}_down`;
    this._hass.callService("button", "press", {
      entity_id: buttonEntity,
    });
  }

  handleFilterChange(filter) {
    this._filter = filter;
    this.updateHabits();
    this.render();
  }

  showMoreInfo(entityId) {
    const event = new Event("hass-more-info", {
      bubbles: true,
      composed: true,
    });
    event.detail = { entityId };
    this.dispatchEvent(event);
  }

  openCreateDialog() {
    this._showCreateDialog = true;
    this.render();
  }

  closeCreateDialog() {
    this._showCreateDialog = false;
    this.render();
  }

  async handleCreateHabit(event) {
    event.preventDefault();

    const form = this.shadowRoot.querySelector("#create-habit-form");
    const formData = new FormData(form);

    const name = formData.get("name");
    const notes = formData.get("notes");
    const up = formData.get("up") === "on";
    const down = formData.get("down") === "on";

    if (!name) {
      alert("Habit name is required");
      return;
    }

    // Get config_entry_id from any existing habit sensor
    let configEntryId = null;
    const firstHabit = Object.values(this._hass.states).find(
      (state) =>
        state.entity_id.startsWith("sensor.") && state.attributes.habit_id
    );

    if (firstHabit && firstHabit.attributes.entry_id) {
      configEntryId = firstHabit.attributes.entry_id;
    }

    if (!configEntryId) {
      alert(
        "Could not find Habitica integration. Please restart Home Assistant and ensure you have at least one habit configured."
      );
      return;
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

    try {
      await this._hass.callWS({
        type: "call_service",
        domain: "habitica",
        service: "create_habit",
        service_data: serviceData,
        return_response: true,
      });
      this.closeCreateDialog();

      // Show success message
      const successEvent = new CustomEvent("hass-notification", {
        detail: { message: `Habit "${name}" created successfully!` },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(successEvent);

      // Refresh will happen automatically when the new sensor is added
    } catch (error) {
      alert(`Failed to create habit: ${error.message}`);
    }
  }

  render() {
    if (!this.config) return;

    // Save scroll position before re-render
    const container = this.shadowRoot.querySelector(".habits-container");
    if (container) {
      this._scrollPosition = container.scrollTop;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --habitica-best: #4f2a93;
          --habitica-best-light: #6133b4;
          --habitica-better: #3b76dd;
          --habitica-better-light: #4a8df5;
          --habitica-neutral: #ffbe5d;
          --habitica-neutral-light: #ffd180;
          --habitica-worse: #f74e52;
          --habitica-worse-light: #ff6b6e;
          --habitica-worst: #c42c2f;
          --habitica-worst-light: #e03e41;
          
          /* Habitica brand colors */
          --habitica-orange: #ff9833;
          --habitica-orange-dark: #e67e22;
          --habitica-purple: #6133b4;
          --habitica-green: #46a546;
          --habitica-blue: #3b76dd;
          
          /* Frequency colors - darkened for dark mode */
          --daily-color: #3d8b3d;
          --weekly-color: #2d5fb8;
          --monthly-color: #7a29a3;
        }

        ha-card {
          padding: 0;
          overflow: hidden;
        }

        .header {
          padding: 16px;
          background: var(--card-background-color);
          border-bottom: 3px solid var(--habitica-orange);
          color: var(--primary-text-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header h2 {
          margin: 0;
          font-size: 1.2em;
          font-weight: 500;
        }

        .habit-count {
          font-size: 0.9em;
          opacity: 0.9;
        }

        .create-button {
          padding: 8px 16px;
          background: linear-gradient(135deg, var(--habitica-orange) 0%, var(--habitica-orange-dark) 100%);
          border: 2px solid var(--habitica-orange-dark);
          border-radius: 6px;
          color: white;
          cursor: pointer;
          font-size: 0.9em;
          font-weight: 600;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .create-button:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .filter-bar {
          display: flex;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255, 152, 51, 0.1);
          border-bottom: 1px solid rgba(255, 152, 51, 0.2);
        }

        .filter-button {
          flex: 1;
          padding: 8px 12px;
          border: 2px solid rgba(255, 152, 51, 0.3);
          border-radius: 6px;
          background: rgba(255, 152, 51, 0.05);
          color: var(--habitica-orange);
          cursor: pointer;
          font-size: 0.9em;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .filter-button:hover {
          background: rgba(255, 152, 51, 0.15);
          border-color: var(--habitica-orange);
          transform: translateY(-1px);
        }

        .filter-button.active {
          background: linear-gradient(135deg, var(--habitica-orange) 0%, var(--habitica-orange-dark) 100%);
          color: white;
          border-color: var(--habitica-orange-dark);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .habits-container {
          max-height: 600px;
          overflow-y: auto;
        }

        .habit-item {
          display: flex;
          align-items: stretch;
          border-bottom: 1px solid var(--divider-color);
          transition: background-color 0.2s ease;
        }

        .habit-item:hover {
          background: var(--secondary-background-color);
        }

        .control-button {
          flex: 0 0 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          padding: 0;
          transition: all 0.2s ease;
          opacity: 0.9;
        }

        .control-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .control-button:not(:disabled):hover {
          opacity: 1;
          filter: brightness(1.2);
        }

        .control-button svg {
          width: 20px;
          height: 20px;
          fill: white;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        }

        /* Frequency-based button colors */
        .freq-daily .control-left { background: var(--daily-color); }
        .freq-daily .control-right { background: var(--daily-color); }
        .freq-weekly .control-left { background: var(--weekly-color); }
        .freq-weekly .control-right { background: var(--weekly-color); }
        .freq-monthly .control-left { background: var(--monthly-color); }
        .freq-monthly .control-right { background: var(--monthly-color); }

        .habit-content {
          flex: 1;
          padding: 12px 16px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .habit-info {
          flex: 1;
        }

        .habit-name {
          font-size: 1em;
          font-weight: 500;
          margin: 0 0 4px 0;
          color: var(--primary-text-color);
        }

        .habit-meta {
          display: flex;
          gap: 12px;
          align-items: center;
          font-size: 0.85em;
          color: var(--secondary-text-color);
        }

        .frequency-badge {
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.75em;
          color: white;
        }

        .frequency-badge.daily {
          background: var(--daily-color);
        }

        .frequency-badge.weekly {
          background: var(--weekly-color);
        }

        .frequency-badge.monthly {
          background: var(--monthly-color);
        }

        .counters {
          display: flex;
          gap: 4px;
        }

        .habit-value {
          font-size: 1.3em;
          font-weight: bold;
          margin-left: 16px;
        }

        /* Frequency-based value colors */
        .freq-daily .habit-value {
          color: var(--daily-color);
        }

        .freq-weekly .habit-value {
          color: var(--weekly-color);
        }

        .freq-monthly .habit-value {
          color: var(--monthly-color);
        }

        .empty-state {
          padding: 48px 16px;
          text-align: center;
          color: var(--secondary-text-color);
        }

        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        /* Motivation and Stats */
        .motivation-card {
          margin: 16px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(255, 152, 51, 0.15) 0%, rgba(230, 126, 34, 0.15) 100%);
          border: 2px solid rgba(255, 152, 51, 0.3);
          overflow: hidden;
        }

        .motivation-header {
          padding: 12px 16px;
          background: rgba(255, 152, 51, 0.2);
          border-bottom: 2px solid rgba(255, 152, 51, 0.3);
          font-weight: 700;
          font-size: 0.95em;
          color: var(--habitica-orange);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .motivation-body {
          padding: 16px;
          font-size: 1.05em;
          line-height: 1.5;
          color: var(--primary-text-color);
          font-weight: 500;
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          padding: 16px;
          background: var(--secondary-background-color);
        }

        .stat-card {
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          transition: all 0.2s ease;
          cursor: pointer;
          border: 2px solid transparent;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .stat-card.daily {
          background: rgba(61, 139, 61, 0.15);
          border-color: var(--daily-color);
        }

        .stat-card.daily:hover {
          background: rgba(61, 139, 61, 0.25);
        }

        .stat-card.weekly {
          background: rgba(45, 95, 184, 0.15);
          border-color: var(--weekly-color);
        }

        .stat-card.weekly:hover {
          background: rgba(45, 95, 184, 0.25);
        }

        .stat-card.monthly {
          background: rgba(122, 41, 163, 0.15);
          border-color: var(--monthly-color);
        }

        .stat-card.monthly:hover {
          background: rgba(122, 41, 163, 0.25);
        }

        .stat-number {
          font-size: 2.5em;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .stat-card.daily .stat-number {
          color: var(--daily-color);
        }

        .stat-card.weekly .stat-number {
          color: var(--weekly-color);
        }

        .stat-card.monthly .stat-number {
          color: var(--monthly-color);
        }

        .stat-label {
          font-size: 0.9em;
          color: var(--secondary-text-color);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Dialog styles */
        .dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .dialog {
          background: var(--card-background-color);
          border-radius: 8px;
          padding: 0;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          border: 1px solid rgba(255, 152, 51, 0.3);
        }

        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: var(--secondary-background-color);
          border-bottom: 3px solid var(--habitica-orange);
          color: var(--primary-text-color);
        }

        .dialog-title {
          font-size: 1.3em;
          font-weight: 600;
          margin: 0;
          color: var(--habitica-orange);
        }

        .dialog-body {
          padding: 24px;
        }

        .dialog-close {
          background: none;
          border: none;
          font-size: 1.5em;
          cursor: pointer;
          color: var(--secondary-text-color);
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .dialog-close:hover {
          background: rgba(255, 152, 51, 0.2);
          color: var(--habitica-orange);
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: var(--habitica-orange);
          font-size: 0.95em;
        }

        .form-input {
          width: 100%;
          padding: 10px;
          border: 2px solid rgba(255, 152, 51, 0.3);
          border-radius: 4px;
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          font-size: 1em;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--habitica-orange);
          background: var(--card-background-color);
        }

        .form-textarea {
          min-height: 80px;
          resize: vertical;
          font-family: inherit;
        }

        .form-checkboxes {
          display: flex;
          gap: 24px;
          margin-top: 8px;
          justify-content: center;
        }

        .checkbox-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: var(--primary-text-color);
        }

        .checkbox-wrapper {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(255, 152, 51, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          border: 3px solid rgba(255, 152, 51, 0.3);
        }

        .checkbox-label input[type="checkbox"]:checked + .checkbox-wrapper {
          background: linear-gradient(135deg, var(--habitica-orange) 0%, var(--habitica-orange-dark) 100%);
          border-color: var(--habitica-orange-dark);
        }

        .checkbox-label input[type="checkbox"] {
          display: none;
        }

        .checkbox-icon {
          font-size: 28px;
          font-weight: bold;
          color: var(--habitica-orange);
        }

        .checkbox-label input[type="checkbox"]:checked + .checkbox-wrapper .checkbox-icon {
          color: white;
        }

        .checkbox-text {
          font-weight: 600;
          font-size: 0.9em;
        }

        .dialog-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .dialog-button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dialog-button-cancel {
          background: var(--secondary-background-color);
          color: var(--primary-text-color);
          border: 2px solid rgba(255, 152, 51, 0.3);
        }

        .dialog-button-cancel:hover {
          background: rgba(255, 152, 51, 0.15);
          border-color: var(--habitica-orange);
        }

        .dialog-button-submit {
          background: linear-gradient(135deg, var(--habitica-orange) 0%, var(--habitica-orange-dark) 100%);
          color: white;
        }

        .dialog-button-submit:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
      </style>

      <ha-card>
        <div class="header">
          <div class="header-left">
            <h2>${this.config.title}</h2>
            <button class="create-button" onclick="this.getRootNode().host.openCreateDialog()">
              <svg width="14" height="14" viewBox="0 0 10 10" fill="currentColor">
                <path fill-rule="evenodd" d="M6 4V0H4v4H0v2h4v4h2V6h4V4H6z"></path>
              </svg>
              New Habit
            </button>
          </div>
          <span class="habit-count">${this._habits.length} habit${this._habits.length !== 1 ? "s" : ""}</span>
        </div>

        ${
          this.config.show_filter
            ? `
          <div class="filter-bar">
            <button 
              class="filter-button ${this._filter === "all" ? "active" : ""}"
              onclick="this.getRootNode().host.handleFilterChange('all')"
            >
              All
            </button>
            <button 
              class="filter-button ${this._filter === "daily" ? "active" : ""}"
              onclick="this.getRootNode().host.handleFilterChange('daily')"
            >
              Daily
            </button>
            <button 
              class="filter-button ${this._filter === "weekly" ? "active" : ""}"
              onclick="this.getRootNode().host.handleFilterChange('weekly')"
            >
              Weekly
            </button>
            <button 
              class="filter-button ${this._filter === "monthly" ? "active" : ""}"
              onclick="this.getRootNode().host.handleFilterChange('monthly')"
            >
              Monthly
            </button>
          </div>
        `
            : ""
        }

        ${
          this._motivation
            ? `
          <div class="motivation-card">
            <div class="motivation-header">
              ✨ Daily Motivation
            </div>
            <div class="motivation-body">
              ${this._motivation}
            </div>
          </div>
        `
            : ""
        }

        <div class="stats-container">
          <div class="stat-card daily" onclick="this.getRootNode().host.handleFilterChange('daily')">
            <div class="stat-number">${this._dailyCount}</div>
            <div class="stat-label">Daily</div>
          </div>
          <div class="stat-card weekly" onclick="this.getRootNode().host.handleFilterChange('weekly')">
            <div class="stat-number">${this._weeklyCount}</div>
            <div class="stat-label">Weekly</div>
          </div>
          <div class="stat-card monthly" onclick="this.getRootNode().host.handleFilterChange('monthly')">
            <div class="stat-number">${this._monthlyCount}</div>
            <div class="stat-label">Monthly</div>
          </div>
        </div>

        <div class="habits-container">
          ${
            this._habits.length === 0
              ? `
            <div class="empty-state">
              <div class="empty-state-icon">🎯</div>
              <div>No ${this._filter !== "all" ? this._filter : ""} habits found</div>
            </div>
          `
              : this._habits
                  .map(
                    (habit) => `
            <div class="habit-item freq-${habit.frequency}">
              <button 
                class="control-button control-left"
                onclick="this.getRootNode().host.handleScoreUp('${habit.habit_id}', '${habit.entity_id}')"
                aria-label="Score up"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
                  <path fill-rule="evenodd" d="M6 4V0H4v4H0v2h4v4h2V6h4V4H6z"></path>
                </svg>
              </button>

              <div class="habit-content" onclick="this.getRootNode().host.showMoreInfo('${habit.entity_id}')">
                <div class="habit-info">
                  <h3 class="habit-name">${habit.name}</h3>
                  <div class="habit-meta">
                    <span class="frequency-badge ${habit.frequency}">${habit.frequency}</span>
                    <div class="counters">
                      <span>↑ ${habit.counter_up}</span>
                      <span>|</span>
                      <span>↓ ${habit.counter_down}</span>
                    </div>
                  </div>
                </div>
                <div class="habit-value">
                  ${habit.value.toFixed(2)}
                </div>
              </div>

              <button 
                class="control-button control-right"
                onclick="this.getRootNode().host.handleScoreDown('${habit.habit_id}', '${habit.entity_id}')"
                aria-label="Score down"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 2">
                  <path fill-rule="evenodd" d="M0 0h10v2H0z"></path>
                </svg>
              </button>
            </div>
          `
                  )
                  .join("")
          }
        </div>
      </ha-card>

      ${
        this._showCreateDialog
          ? `
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
      `
          : ""
      }
    `;

    // Restore scroll position after re-render
    requestAnimationFrame(() => {
      const habitContainer = this.shadowRoot.querySelector(".habits-container");
      if (habitContainer && this._scrollPosition) {
        habitContainer.scrollTop = this._scrollPosition;
      }
    });
  }

  getCardSize() {
    return 3 + Math.min(this._habits.length, 10);
  }

  static getConfigElement() {
    return document.createElement("habitica-habits-list-card-editor");
  }

  static getStubConfig() {
    return {
      title: "My Habitica Habits",
      show_filter: true,
      filter: "all",
      sort_by: "value",
      sort_direction: "desc",
    };
  }
}

customElements.define("habitica-habits-list-card", HabiticaHabitsListCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "habitica-habits-list-card",
  name: "Habitica Habits List",
  description: "Display all your Habitica habits in a scrollable list",
  preview: true,
  documentationURL:
    "https://github.com/home-assistant/core/tree/dev/homeassistant/components/habitica",
});
