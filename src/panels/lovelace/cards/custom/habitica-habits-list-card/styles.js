/**
 * Styles for Habitica Habits List Card
 */

export const styles = `
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
`;
