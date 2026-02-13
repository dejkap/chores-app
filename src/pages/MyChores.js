export function MyChores() {
  // Check if date exists in sessionStorage; if not, initialize with today
  let storedDate = sessionStorage.getItem('selectedDate');
  let today;
  
  if (storedDate) {
    // Parse the stored YYYY-MM-DD date as local date
    today = new Date(storedDate + "T00:00:00");
  } else {
    // First time in session: use today and store it
    today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    sessionStorage.setItem('selectedDate', todayStr);
  }
  
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  
  console.log("App initialized with date:", todayStr);

  return `
    <div id="taskListWrapper" style="height:100%; display:flex; flex-direction:column;">
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
      <div id="taskList" style="overflow-y:auto; flex:1 1 auto;"></div>
    </div>
  `;
}



