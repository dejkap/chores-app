export function MyChores() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  return `
    <div id="taskListWrapper">
      <div id="headerWrapper">
        <h1 class="page-title">My Chores</h1>
        
        <div class="daily-nav-container">
          <button id="prevDayBtn" class="daily-nav-btn daily-nav-arrow">←</button>
          <div class="daily-nav-date">
            <span id="dateDisplayText">${today.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</span>
            <input type="date" id="dayPicker" value="${todayStr}" />
          </div>
          <button id="nextDayBtn" class="daily-nav-btn daily-nav-arrow">→</button>
        </div>
        
        <button id="addTaskBtn" class="btn-primary">Add Task</button>
      </div>
      <div id="taskList"></div>
    </div>
  `;
}



