/**
 * Habitica Habits List Card
 *
 * Automatically displays all Habitica habits in a scrollable list
 * Each habit shows with score up/down buttons
 */

import {
  parseHabitsFromStates,
  sortHabits,
  getMotivation,
  getFrequencyCounts,
} from "./habitica-habits-list-card/utils";

import { styles } from "./habitica-habits-list-card/styles";

import {
  renderHeader,
  renderFilterBar,
  renderMotivation,
  renderStats,
  renderHabitsList,
} from "./habitica-habits-list-card/components";

import {
  renderCreateDialog,
  handleCreateHabitSubmit,
} from "./habitica-habits-list-card/create-dialog";

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
    this._motivation = getMotivation(this._hass);

    // Get frequency stats
    const counts = getFrequencyCounts(this._hass);
    this._dailyCount = counts.daily;
    this._weeklyCount = counts.weekly;
    this._monthlyCount = counts.monthly;

    // Parse and filter habits
    const habits = parseHabitsFromStates(this._hass, this._filter);

    // Sort habits
    this._habits = sortHabits(habits, this.config.sort_by, this.config.sort_direction);
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

    try {
      const habitName = await handleCreateHabitSubmit(this._hass, this.shadowRoot);
      this.closeCreateDialog();

      // Show success message
      const successEvent = new CustomEvent("hass-notification", {
        detail: { message: `Habit "${habitName}" created successfully!` },
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

    // Render the card
    this.shadowRoot.innerHTML = `
      ${styles}

      <ha-card>
        ${renderHeader(this.config.title, this._habits.length)}

        ${this.config.show_filter ? renderFilterBar(this._filter) : ''}

        ${renderMotivation(this._motivation)}

        ${renderStats(this._dailyCount, this._weeklyCount, this._monthlyCount)}

        <div class="habits-container">
          ${renderHabitsList(this._habits, this._filter)}
        </div>
      </ha-card>

      ${this._showCreateDialog ? renderCreateDialog() : ''}
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
