export function Settings() {
  return `
    <div class="settings-container">
      <h2>Settings</h2>

      <div class="settings-section">
        <h3>Preferences</h3>
        
        <div class="settings-option">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="notifyCheckbox" />
            <span>Enable Notifications</span>
          </label>
        </div>

        <div class="settings-option">
          <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="soundCheckbox" />
            <span>Sound Effects</span>
          </label>
        </div>
      </div>

      <div class="settings-section">
        <h3>Data Management</h3>
        
        <div class="settings-option">
          <button id="exportBtn" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Export Tasks
          </button>
        </div>

        <div class="settings-option">
          <button id="clearBtn" style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer;">
            Clear All Tasks
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h3>About</h3>
        <p style="color: #666; font-size: 14px;">Chores App v1.0</p>
        <p style="color: #999; font-size: 12px;">A simple task management application for organizing daily chores and activities.</p>
      </div>

      <div class="settings-info" style="margin-top: 20px; padding: 15px; background: #f9f9f9; border-radius: 6px; border-left: 4px solid #007bff;">
        <p style="margin: 0; color: #666; font-size: 14px;">
          <strong>More settings coming soon:</strong> Custom themes, task reminders, recurring tasks, and more.
        </p>
      </div>
    </div>
  `;
}
