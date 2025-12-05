export function Calendar() {
  // Get stored calendar state or use today
  const storedDate = localStorage.getItem("calendarSelectedDate");
  const selectedDate = storedDate ? new Date(storedDate) : new Date();
  
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Month name
  const monthName = selectedDate.toLocaleString("en-US", { month: "long" });
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const selectedDateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  // Build calendar grid
  let calendarHTML = `
    <div class="calendar-container">
      <!-- Fixed upper section: Calendar -->
      <div class="calendar-fixed">
        <div class="calendar-header">
          <div class="calendar-header-nav">
            <button id="prevMonth" class="calendar-nav-btn calendar-arrow">←</button>
            <button id="monthYearBtn" class="calendar-header-selector">${monthName} ${year}</button>
            <button id="nextMonth" class="calendar-nav-btn calendar-arrow">→</button>
          </div>
        </div>
        
        <div class="calendar-weekdays">
          <div class="weekday">Sun</div>
          <div class="weekday">Mon</div>
          <div class="weekday">Tue</div>
          <div class="weekday">Wed</div>
          <div class="weekday">Thu</div>
          <div class="weekday">Fri</div>
          <div class="weekday">Sat</div>
        </div>
        
        <div class="calendar-grid">
    `;

      // Empty cells before first day
      for (let i = 0; i < firstDay; i++) {
        calendarHTML += `<div class="calendar-day empty"></div>`;
      }

      // Days of month
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const isToday = dayStr === todayStr;
        const isSelected = dayStr === selectedDateStr;
        const todayClass = isToday ? "today" : "";
        const selectedClass = isSelected ? "selected" : "";
        calendarHTML += `<div class="calendar-day ${todayClass} ${selectedClass}" data-date="${dayStr}">${day}</div>`;
      }

      calendarHTML += `
        </div>

        <div class="calendar-selected-info">
          <p><strong>Selected:</strong> <span id="selectedDateDisplay">${selectedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span></p>
          <button id="addTaskCalendarBtn" class="btn-primary">Add Task for This Date</button>
        </div>
      </div>

      <!-- Scrollable lower section: Tasks -->
      <div class="calendar-tasks-container">
        <h3>Tasks for this date:</h3>
        <div id="taskPreviewList" style="font-size: 14px; color: #999;">No tasks for this date</div>
      </div>
    </div>
  `;

  return calendarHTML;
}
