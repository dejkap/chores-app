export function Stats() {
  return `
    <div class="stats-container">
      <h2>Task Statistics</h2>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number" id="todoCount">0</div>
          <div class="stat-label">To-Do Tasks</div>
        </div>

        <div class="stat-card">
          <div class="stat-number" id="doneCount">0</div>
          <div class="stat-label">Completed Tasks</div>
        </div>

        <div class="stat-card">
          <div class="stat-number" id="totalCount">0</div>
          <div class="stat-label">Total Tasks</div>
        </div>
      </div>

      <div class="stats-info">
        <h3>Daily Overview</h3>
        <p style="color: #999; font-size: 14px;">Detailed daily statistics and task tracking will appear here.</p>
        <p style="color: #999; font-size: 14px; margin-top: 10px;">Future features: completion rate, productivity trends, task completion charts.</p>
      </div>
    </div>
  `;
}
