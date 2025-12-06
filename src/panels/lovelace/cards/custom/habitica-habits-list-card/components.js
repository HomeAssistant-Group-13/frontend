/**
 * Component templates for Habitica Habits List Card
 */

/**
 * Render the header section
 */
export function renderHeader(title, habitCount, showCreateButton = true) {
  return `
    <div class="header">
      <div class="header-left">
        <h2>${title}</h2>
        ${
          showCreateButton
            ? `
          <button class="create-button" onclick="this.getRootNode().host.openCreateDialog()">
            <svg width="14" height="14" viewBox="0 0 10 10" fill="currentColor">
              <path fill-rule="evenodd" d="M6 4V0H4v4H0v2h4v4h2V6h4V4H6z"></path>
            </svg>
            New Habit
          </button>
        `
            : ""
        }
      </div>
      <span class="habit-count">${habitCount} habit${habitCount !== 1 ? "s" : ""}</span>
    </div>
  `;
}

/**
 * Render the filter bar
 */
export function renderFilterBar(currentFilter) {
  const filters = ["all", "daily", "weekly", "monthly"];

  return `
    <div class="filter-bar">
      ${filters
        .map(
          (filter) => `
        <button 
          class="filter-button ${currentFilter === filter ? "active" : ""}"
          onclick="this.getRootNode().host.handleFilterChange('${filter}')"
        >
          ${filter.charAt(0).toUpperCase() + filter.slice(1)}
        </button>
      `
        )
        .join("")}
    </div>
  `;
}

/**
 * Render the motivation card
 */
export function renderMotivation(motivation) {
  if (!motivation) return "";

  return `
    <div class="motivation-card">
      <div class="motivation-header">
        ✨ Daily Motivation
      </div>
      <div class="motivation-body">
        ${motivation}
      </div>
    </div>
  `;
}

/**
 * Render the statistics section
 */
export function renderStats(dailyCount, weeklyCount, monthlyCount) {
  return `
    <div class="stats-container">
      <div class="stat-card daily" onclick="this.getRootNode().host.handleFilterChange('daily')">
        <div class="stat-number">${dailyCount}</div>
        <div class="stat-label">Daily</div>
      </div>
      <div class="stat-card weekly" onclick="this.getRootNode().host.handleFilterChange('weekly')">
        <div class="stat-number">${weeklyCount}</div>
        <div class="stat-label">Weekly</div>
      </div>
      <div class="stat-card monthly" onclick="this.getRootNode().host.handleFilterChange('monthly')">
        <div class="stat-number">${monthlyCount}</div>
        <div class="stat-label">Monthly</div>
      </div>
    </div>
  `;
}

/**
 * Render a single habit item
 */
export function renderHabitItem(habit) {
  return `
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
  `;
}

/**
 * Render the habits list
 */
export function renderHabitsList(habits, filter) {
  if (habits.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        <div>No ${filter !== "all" ? filter : ""} habits found</div>
      </div>
    `;
  }

  return habits.map((habit) => renderHabitItem(habit)).join("");
}
