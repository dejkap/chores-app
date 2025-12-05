import { MyChores } from "./pages/MyChores.js";
import { Calendar } from "./pages/Calendar.js";
import { Stats } from "./pages/Stats.js";
import { Settings } from "./pages/Settings.js";
import { getTasks, addTask, updateTask, deleteTask } from './supabaseClient.js';

const app = document.getElementById("app");

// --- Funkce pro načtení stránky ---
function loadPage(page) {
  let pageContent = "";

  if (page === "chores") {
    pageContent = MyChores();
    
    app.innerHTML = `
      <div id="content">
        ${pageContent}
      </div>

      <nav>
        <button data-page="chores" class="active">My Chores</button>
        <button data-page="calendar">Calendar</button>
        <button data-page="stats">Stats</button>
        <button data-page="settings">Settings</button>
      </nav>

      <!-- MODAL - Add Task -->
      <div id="taskModal" class="modal hidden">
        <div class="modal-content">
          <h2>Add New Task</h2>

          <label>Task name:</label>
          <input id="modalName" type="text" placeholder="Enter task name" />

          <label>Description:</label>
          <textarea id="modalDescription" placeholder="Enter description"></textarea>

          <label>Priority:</label>
          <div class="priority-group">
            <button data-priority="low">Low</button>
            <button data-priority="normal" class="active">Normal</button>
            <button data-priority="high">High</button>
          </div>

          <label id="dateLabel">Date:</label>
          <input id="modalDate" type="date" />

          <div class="modal-actions">
            <button id="saveTaskBtn" class="save">Save</button>
            <button id="closeModalBtn" class="cancel">Cancel</button>
          </div>
        </div>
      </div>

      <!-- MODAL - Edit Task -->
      <div id="editTaskModal" class="modal hidden">
        <div class="modal-content">
          <h2>Edit Task</h2>

          <label>Task name:</label>
          <input id="editModalName" type="text" placeholder="Enter task name" />

          <label>Description:</label>
          <textarea id="editModalDescription" placeholder="Enter description"></textarea>

          <label>Priority:</label>
          <div class="priority-group" id="editPriorityGroup">
            <button data-priority="low">Low</button>
            <button data-priority="normal" class="active">Normal</button>
            <button data-priority="high">High</button>
          </div>

          <label id="editDateLabel">Date:</label>
          <input id="editModalDate" type="date" />

          <div class="modal-actions">
            <button id="saveEditTaskBtn" class="save">Save</button>
            <button id="closeEditModalBtn" class="cancel">Cancel</button>
          </div>
        </div>
      </div>
    `;

    setupTaskListeners();
    setupEditModalListeners();
    setupMyChoresDateNavigation();
    renderTasks();
  } else if (page === "calendar") {
    pageContent = Calendar();
    
    app.innerHTML = `
      <div id="content">
        ${pageContent}
      </div>

      <nav>
        <button data-page="chores">My Chores</button>
        <button data-page="calendar" class="active">Calendar</button>
        <button data-page="stats">Stats</button>
        <button data-page="settings">Settings</button>
      </nav>

      <!-- MODAL - Add Task (Calendar) -->
      <div id="taskModal" class="modal hidden">
        <div class="modal-content">
          <h2>Add Task for Calendar</h2>

          <label>Task name:</label>
          <input id="modalName" type="text" placeholder="Enter task name" />

          <label>Description:</label>
          <textarea id="modalDescription" placeholder="Enter description"></textarea>

          <label>Priority:</label>
          <div class="priority-group">
            <button data-priority="low">Low</button>
            <button data-priority="normal" class="active">Normal</button>
            <button data-priority="high">High</button>
          </div>

          <label>Date:</label>
          <div id="dateDisplay" style="padding: 8px; background: #f0f0f0; border-radius: 6px; margin-bottom: 10px; color: #666; font-size: 14px;"></div>
          <input id="modalDate" type="hidden" />

          <div class="modal-actions">
            <button id="saveTaskBtn" class="save">Save</button>
            <button id="closeModalBtn" class="cancel">Cancel</button>
          </div>
        </div>
      </div>
      
      <!-- MODAL - Edit Task (shared with MyChores) -->
      <div id="editTaskModal" class="modal hidden">
        <div class="modal-content">
          <h2>Edit Task</h2>

          <label>Task name:</label>
          <input id="editModalName" type="text" placeholder="Enter task name" />

          <label>Description:</label>
          <textarea id="editModalDescription" placeholder="Enter description"></textarea>

          <label>Priority:</label>
          <div class="priority-group" id="editPriorityGroup">
            <button data-priority="low">Low</button>
            <button data-priority="normal" class="active">Normal</button>
            <button data-priority="high">High</button>
          </div>

          <label id="editDateLabel">Date:</label>
          <input id="editModalDate" type="date" />

          <div class="modal-actions">
            <button id="saveEditTaskBtn" class="save">Save</button>
            <button id="closeEditModalBtn" class="cancel">Cancel</button>
          </div>
        </div>
      </div>
    `;

    setupCalendarListeners();
    // Ensure edit modal listeners are available on the calendar page as well
    setupEditModalListeners();
  } else if (page === "stats") {
    pageContent = Stats();
    
    app.innerHTML = `
      <div id="content">
        ${pageContent}
      </div>

      <nav>
        <button data-page="chores">My Chores</button>
        <button data-page="calendar">Calendar</button>
        <button data-page="stats" class="active">Stats</button>
        <button data-page="settings">Settings</button>
      </nav>
    `;

    // Update stats after page loads
    updateStats();
  } else if (page === "settings") {
    pageContent = Settings();
    
    app.innerHTML = `
      <div id="content">
        ${pageContent}
      </div>

      <nav>
        <button data-page="chores">My Chores</button>
        <button data-page="calendar">Calendar</button>
        <button data-page="stats">Stats</button>
        <button data-page="settings" class="active">Settings</button>
      </nav>
    `;

    // Setup settings event listeners
    setupSettingsListeners();
  }
}

// --- Update Stats ---
async function updateStats() {
  const tasks = await getTasks();
  const todoCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;

  const todoEl = document.getElementById("todoCount");
  const doneEl = document.getElementById("doneCount");
  const totalEl = document.getElementById("totalCount");

  if (todoEl) todoEl.textContent = todoCount;
  if (doneEl) doneEl.textContent = doneCount;
  if (totalEl) totalEl.textContent = totalCount;
}

// --- Setup Settings Listeners ---
function setupSettingsListeners() {
  const notifyCheckbox = document.getElementById("notifyCheckbox");
  const soundCheckbox = document.getElementById("soundCheckbox");
  const exportBtn = document.getElementById("exportBtn");
  const clearBtn = document.getElementById("clearBtn");

  // Load saved preferences
  if (notifyCheckbox) {
    notifyCheckbox.checked = localStorage.getItem("notificationsEnabled") === "true";
    notifyCheckbox.addEventListener("change", (e) => {
      localStorage.setItem("notificationsEnabled", e.target.checked);
    });
  }

  if (soundCheckbox) {
    soundCheckbox.checked = localStorage.getItem("soundEnabled") === "true";
    soundCheckbox.addEventListener("change", (e) => {
      localStorage.setItem("soundEnabled", e.target.checked);
    });
  }

  // Export tasks as JSON
  if (exportBtn) {
    exportBtn.addEventListener("click", async () => {
      try {
        const tasks = await getTasks();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "chores_export.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
      } catch (err) {
        console.error('Error exporting tasks', err);
        alert('Failed to export tasks');
      }
    });
  }

  // Clear all tasks
  if (clearBtn) {
    clearBtn.addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete all tasks? This cannot be undone.")) {
        try {
          const tasks = await getTasks();
          for (const t of tasks) {
            await deleteTask(t.id);
          }
          alert("All tasks have been cleared.");
        } catch (err) {
          console.error('Error clearing tasks', err);
          alert('Failed to clear tasks.');
        }
      }
    });
  }
}

// --- Navigace ---
document.addEventListener("click", (e) => {
  if (e.target.matches("nav button")) {
    const page = e.target.dataset.page;

    // upravíme aktivní tlačítko
    document.querySelectorAll("nav button").forEach((btn) =>
      btn.classList.remove("active")
    );
    e.target.classList.add("active");

    loadPage(page);
  }
});

// --- Setup Task Listeners ---
function setupTaskListeners() {
  const addBtn = document.getElementById("addTaskBtn");
  const modal = document.getElementById("taskModal");
  const closeBtn = document.getElementById("closeModalBtn");
  const saveBtn = document.getElementById("saveTaskBtn");
  const nameInput = document.getElementById("modalName");
  const descInput = document.getElementById("modalDescription");
  const dateInput = document.getElementById("modalDate");
  const priorityButtons = document.querySelectorAll(".priority-group button");

  let selectedPriority = "normal";

  // Set default date to today when modal opens
  addBtn.addEventListener("click", () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    dateInput.value = todayStr;
    modal.classList.remove("hidden");
  });

  // --- Zavření modalu ---
  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    clearModal();
  });

  // --- Výběr priority ---
  priorityButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      priorityButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedPriority = btn.dataset.priority;
    });
  });

  // --- Uložení tasku ---
  saveBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    const date = dateInput.value;

    if (!name) {
      alert("Task must have a name!");
      return;
    }

    try {
      await addTask({
        name,
        description,
        priority: selectedPriority,
        done: false,
        date: date,
      });

      await renderTasks();
      modal.classList.add("hidden");
      clearModal();
    } catch (err) {
      console.error("Error adding task:", err);
      alert("Failed to add task. See console for details.");
    }
  });

  // --- Funkce na vyčištění modalu ---
  function clearModal() {
    nameInput.value = "";
    descInput.value = "";
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    dateInput.value = todayStr;
    selectedPriority = "normal";
    priorityButtons.forEach((b) => {
      b.classList.remove("active");
      if (b.dataset.priority === "normal") b.classList.add("active");
    });
  }
}

// --- Setup Calendar Listeners ---
function setupCalendarListeners() {
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");
  const monthYearBtn = document.getElementById("monthYearBtn");
  const calendarDays = document.querySelectorAll(".calendar-day:not(.empty)");
  const addTaskBtn = document.getElementById("addTaskCalendarBtn");

  // Navigate months
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const currentDate = new Date(localStorage.getItem("calendarSelectedDate") || new Date());
      currentDate.setMonth(currentDate.getMonth() - 1);
      localStorage.setItem("calendarSelectedDate", currentDate.toISOString());
      loadPage("calendar");
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const currentDate = new Date(localStorage.getItem("calendarSelectedDate") || new Date());
      currentDate.setMonth(currentDate.getMonth() + 1);
      localStorage.setItem("calendarSelectedDate", currentDate.toISOString());
      loadPage("calendar");
    });
  }

  // Open month/year selector
  if (monthYearBtn) {
    monthYearBtn.addEventListener("click", () => {
      openMonthYearSelector();
    });
  }

  // Click on day
  calendarDays.forEach((day) => {
    day.addEventListener("click", () => {
      const dateStr = day.dataset.date;
      const selectedDate = new Date(dateStr);
      localStorage.setItem("calendarSelectedDate", selectedDate.toISOString());
      loadPage("calendar");
    });
  });

  // Add task button
  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
      openCalendarAddTaskModal();
    });
  }

  // Update task preview
  updateCalendarTaskPreview();
  setupCalendarTaskModal();
}

// --- Open Month/Year Selector Modal ---
function openMonthYearSelector() {
  const modal = document.getElementById("monthYearModal");
  const storedDate = localStorage.getItem("calendarSelectedDate");
  const selectedDate = storedDate ? new Date(storedDate) : new Date();

  // Set active month
  const monthButtons = document.querySelectorAll("#monthList button");
  monthButtons.forEach((btn) => {
    btn.classList.remove("active");
    if (Number(btn.dataset.month) === selectedDate.getMonth()) {
      btn.classList.add("active");
    }
  });

  // Generate and set active year
  const yearList = document.getElementById("yearList");
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 10;
  const maxYear = currentYear + 10;

  yearList.innerHTML = "";
  for (let year = maxYear; year >= minYear; year--) {
    const btn = document.createElement("button");
    btn.dataset.year = year;
    btn.textContent = year;
    if (year === selectedDate.getFullYear()) {
      btn.classList.add("active");
    }
    yearList.appendChild(btn);
  }

  // initialize modal dataset so confirm can read default values
  modal.dataset.selectedMonth = selectedDate.getMonth();
  modal.dataset.selectedYear = selectedDate.getFullYear();

  // Setup event listeners for newly created year buttons
  setupMonthYearSelectorsOnOpen();

  modal.classList.remove("hidden");
}

// --- Setup Month/Year Modal Listeners on Modal Open ---
function setupMonthYearSelectorsOnOpen() {
  const monthButtons = document.querySelectorAll("#monthList button");
  const yearButtons = document.querySelectorAll("#yearList button");
  const modal = document.getElementById("monthYearModal");

  monthButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      monthButtons.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      modal.dataset.selectedMonth = Number(e.target.dataset.month);
    });
  });

  yearButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      yearButtons.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      modal.dataset.selectedYear = Number(e.target.dataset.year);
    });
  });
}
// --- Setup Month/Year Modal Listeners ---
function setupMonthYearListeners() {
  const modal = document.getElementById("monthYearModal");
  const confirmBtn = document.getElementById("confirmMonthYearBtn");
  const closeBtn = document.getElementById("closeMonthYearBtn");

  // Close button
  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Confirm button
  confirmBtn.addEventListener("click", () => {
    const storedDate = localStorage.getItem("calendarSelectedDate");
    const currentDate = storedDate ? new Date(storedDate) : new Date();

    // Get selected month and year from modal dataset
    const selectedMonth = Number(modal.dataset.selectedMonth);
    const selectedYear = Number(modal.dataset.selectedYear);

    // Apply selected month and year
    if (!isNaN(selectedMonth)) currentDate.setMonth(selectedMonth);
    if (!isNaN(selectedYear)) currentDate.setFullYear(selectedYear);

    localStorage.setItem("calendarSelectedDate", currentDate.toISOString());
    modal.classList.add("hidden");
    loadPage("calendar");
  });
}

// Initialize month/year selector on page load
document.addEventListener("DOMContentLoaded", () => {
  setupMonthYearListeners();
});

// --- Open Calendar Add Task Modal ---
function openCalendarAddTaskModal() {
  const modal = document.getElementById("taskModal");
  const storedDate = localStorage.getItem("calendarSelectedDate");
  const selectedDate = storedDate ? new Date(storedDate) : new Date();
  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  const dateDisplay = document.getElementById("dateDisplay");
  const modalDate = document.getElementById("modalDate");

  if (dateDisplay) {
    dateDisplay.textContent = selectedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }
  if (modalDate) modalDate.value = dateStr;

  // Clear form
  document.getElementById("modalName").value = "";
  document.getElementById("modalDescription").value = "";
  document.querySelectorAll(".priority-group button").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.priority === "normal") btn.classList.add("active");
  });

  modal.dataset.isCalendarTask = "true";
  modal.classList.remove("hidden");
}

// --- Setup Calendar Task Modal ---
function setupCalendarTaskModal() {
  const modal = document.getElementById("taskModal");
  const saveBtn = document.getElementById("saveTaskBtn");
  const closeBtn = document.getElementById("closeModalBtn");
  const nameInput = document.getElementById("modalName");
  const descInput = document.getElementById("modalDescription");
  const dateInput = document.getElementById("modalDate");
  const priorityButtons = document.querySelectorAll(".priority-group button");

  let selectedPriority = "normal";

  // Close modal
  closeBtn.addEventListener("click", () => {
    modal.dataset.isCalendarTask = "false";
    modal.classList.add("hidden");
  });

  // Priority selection
  priorityButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      priorityButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedPriority = btn.dataset.priority;
    });
  });

  // Save task
  saveBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const description = descInput.value.trim();
    const date = dateInput.value;

    if (!name) {
      alert("Task must have a name!");
      return;
    }

    try {
      await addTask({
        name,
        description,
        priority: selectedPriority,
        done: false,
        date: date,
      });

      modal.dataset.isCalendarTask = "false";
      loadPage("calendar");
    } catch (err) {
      console.error('Error adding calendar task', err);
      alert('Failed to add task for calendar.');
    }
  });
}

// --- Setup Calendar Task Actions (Edit/Delete) ---
async function setupCalendarTaskActions() {
  // Edit Calendar Tasks
  document.querySelectorAll(".calendar-task-edit").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const taskId = btn.dataset.taskId; // Keep as string (UUID)
      if (!taskId) return;
      try {
        const tasks = await getTasks();
        const task = tasks.find((t) => t.id === taskId);
        if (task) openEditModalForCalendar(task);
      } catch (err) {
        console.error('Error fetching tasks for edit', err);
      }
    });
  });

  // Delete Calendar Tasks
  document.querySelectorAll(".calendar-task-delete").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const taskId = btn.dataset.taskId; // Keep as string (UUID)
      if (!taskId) return;
      try {
        await deleteTask(taskId);
        await updateCalendarTaskPreview();
      } catch (err) {
        console.error('Error deleting task', err);
      }
    });
  });
}

// --- Open Edit Modal for Calendar Tasks ---
function openEditModalForCalendar(task) {
  const modal = document.getElementById("editTaskModal");
  const nameInput = document.getElementById("editModalName");
  const descInput = document.getElementById("editModalDescription");
  const priorityButtons = document.querySelectorAll("#editPriorityGroup button");
  const dateInput = document.getElementById("editModalDate");

  // Pre-fill data
  nameInput.value = task.name;
  descInput.value = task.description;
  if (dateInput) {
    dateInput.value = task.date || new Date().toISOString().split('T')[0];
  }

  // Set priority
  priorityButtons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.priority === task.priority) {
      btn.classList.add("active");
    }
  });

  modal.classList.remove("hidden");
  modal.dataset.taskId = task.id;
  modal.dataset.isCalendarTask = "true";
}

// --- Update Calendar Task Preview ---
async function updateCalendarTaskPreview() {
  const storedDate = localStorage.getItem("calendarSelectedDate");
  const selectedDate = storedDate ? new Date(storedDate) : new Date();
  const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  const tasks = await getTasks();
  const tasksForDate = tasks.filter((t) => t.date === dateStr);

  const taskPreviewList = document.getElementById("taskPreviewList");
  if (taskPreviewList) {
    if (tasksForDate.length === 0) {
      taskPreviewList.innerHTML = `<p style="color: #999; font-size: 14px;">No tasks for this date</p>`;
    } else {
      taskPreviewList.innerHTML = tasksForDate
        .map((t) => `
          <div class="calendar-task-card" style="border-left-color: ${t.priority === 'high' ? '#dc3545' : t.priority === 'low' ? '#28a745' : '#007bff'};">
            <strong style="flex-grow: 1;">${t.name}</strong>
            <div style="display:flex; gap:8px; align-items:center;">
              <button class="task-action-icon calendar-task-edit" data-task-id="${t.id}" title="Edit task">✏️</button>
              <button class="task-action-icon calendar-task-delete" data-task-id="${t.id}" title="Delete task">🗑️</button>
            </div>
          </div>
        `)
        .join("");
      
      // Setup edit/delete handlers for calendar tasks
      await setupCalendarTaskActions();
    }
  }
}

// --- Setup MyChores Date Navigation ---
function setupMyChoresDateNavigation() {
  const prevBtn = document.getElementById("prevDayBtn");
  const nextBtn = document.getElementById("nextDayBtn");
  const dayPicker = document.getElementById("dayPicker");
  const dateDisplayText = document.getElementById("dateDisplayText");

  let currentDate = new Date(localStorage.getItem("myChoresCurrentDate") || new Date());

  const updateDisplay = () => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
    localStorage.setItem("myChoresCurrentDate", dateStr);
    dayPicker.value = dateStr;
    dateDisplayText.textContent = currentDate.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
    renderTasks();
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentDate.setDate(currentDate.getDate() - 1);
      updateDisplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentDate.setDate(currentDate.getDate() + 1);
      updateDisplay();
    });
  }

  if (dayPicker) {
    dayPicker.addEventListener("change", (e) => {
      currentDate = new Date(e.target.value);
      updateDisplay();
    });
  }
}

// --- Get sort order (from localStorage or default) ---
function getSortOrder() {
  return localStorage.getItem("taskSortOrder") || "name-asc";
}

// --- Apply sorting to active tasks ---
function sortTasks(tasks, sortOrder) {
  const sorted = [...tasks];
  
  switch (sortOrder) {
    case "name-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "priority-high":
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
      break;
    case "priority-low":
      const priorityOrderLow = { low: 0, normal: 1, high: 2 };
      sorted.sort((a, b) => priorityOrderLow[a.priority] - priorityOrderLow[b.priority]);
      break;
  }
  
  return sorted;
}

// --- Render Tasků ---
async function renderTasks() {
  const taskListContainer = document.getElementById("taskList");
  if (!taskListContainer) return;

  const tasks = await getTasks();

  // Get current date for filtering
  const storedDate = localStorage.getItem("myChoresCurrentDate");
  const currentDate = storedDate ? new Date(storedDate) : new Date();
  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  // Filter tasks for the current date only
  const filteredTasks = tasks.filter((t) => t.date === dateStr);

  if (!filteredTasks.length) {
    taskListContainer.innerHTML = `<p>No tasks for this date. Add some!</p>`;
    setupMyChoresDateNavigation();
    return;
  }

  const activeTasks = filteredTasks.filter((t) => !t.done);
  const doneTasks = filteredTasks.filter((t) => t.done);

  // Get sort order
  const sortOrder = getSortOrder();
  const sortedActiveTasks = sortTasks(activeTasks, sortOrder);

  // Check if sections are expanded (default: To-Do open, Done closed)
  const todoExpanded = localStorage.getItem("todoExpanded") !== "false";
  const doneExpanded = localStorage.getItem("doneExpanded") === "true";

  // Build task cards HTML
  const renderTaskCard = (t) => `
    <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
      <div style="display:flex; align-items:center; gap:8px;">
        <input type="checkbox" data-id="${t.id}" ${t.done ? "checked" : ""}/>
        <div>
          <strong style="${t.done ? "text-decoration: line-through; color:green" : ""}">${t.name}</strong>
          <br/>
          <small>Description: ${t.description}</small><br/>
          <small>Priority: ${t.priority}</small>
        </div>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <button class="task-action-icon" data-action="edit" data-id="${t.id}" title="Edit task">✏️</button>
        <button class="task-action-icon" data-action="delete" data-id="${t.id}" title="Delete task">🗑️</button>
      </div>
    </div>
  `;

  // Build HTML
  let html = '';

  // Sort dropdown
  html += `
    <div style="margin-bottom: 15px;">
      <label for="sortDropdown" style="font-size: 14px; font-weight: bold;">Sort by:</label>
      <select id="sortDropdown" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ccc; border-radius: 6px;">
        <option value="name-asc" ${sortOrder === 'name-asc' ? 'selected' : ''}>Name A–Z</option>
        <option value="name-desc" ${sortOrder === 'name-desc' ? 'selected' : ''}>Name Z–A</option>
        <option value="priority-high" ${sortOrder === 'priority-high' ? 'selected' : ''}>Priority: High first</option>
        <option value="priority-low" ${sortOrder === 'priority-low' ? 'selected' : ''}>Priority: Low first</option>
      </select>
    </div>
  `;

  // To-Do Section
  html += `
    <div class="section-header" data-section="todo">
      <span style="cursor: pointer; user-select: none;">
        <span class="caret">${todoExpanded ? '▼' : '▶'}</span>
        <strong>To-Do (${sortedActiveTasks.length})</strong>
      </span>
    </div>
  `;

  if (todoExpanded) {
    if (sortedActiveTasks.length > 0) {
      html += sortedActiveTasks.map(renderTaskCard).join('');
    } else {
      html += `<p style="text-align: center; color: #999;">No active tasks</p>`;
    }
  }

  // Done Section
  html += `
    <div class="section-header" data-section="done">
      <span style="cursor: pointer; user-select: none;">
        <span class="caret">${doneExpanded ? '▼' : '▶'}</span>
        <strong>Done (${doneTasks.length})</strong>
      </span>
    </div>
  `;

  if (doneExpanded) {
    if (doneTasks.length > 0) {
      html += doneTasks.map(renderTaskCard).join('');
    } else {
      html += `<p style="text-align: center; color: #999;">No completed tasks</p>`;
    }
  }

  taskListContainer.innerHTML = html;

  // --- Sort dropdown listener ---
  document.getElementById("sortDropdown")?.addEventListener("change", async (e) => {
    localStorage.setItem("taskSortOrder", e.target.value);
    await renderTasks();
  });

  // --- Section toggle listeners ---
  document.querySelectorAll(".section-header").forEach((header) => {
    header.addEventListener("click", async () => {
      const section = header.dataset.section;
      const isExpanded = localStorage.getItem(`${section}Expanded`) !== "false";
      localStorage.setItem(`${section}Expanded`, !isExpanded);
      await renderTasks();
    });
  });

  // --- Checkbox listener ---
  document.querySelectorAll("#taskList input[type=checkbox]").forEach((checkbox) => {
    checkbox.addEventListener("change", async (e) => {
      const id = e.target.dataset.id; // Keep as string (UUID)
      if (!id) return;
      try {
        await updateTask(id, { done: e.target.checked });
        await renderTasks();
      } catch (err) {
        console.error('Error updating task done flag', err);
      }
    });
  });

  // --- Edit / Delete ---
  document.querySelectorAll("#taskList button").forEach((btn) => {
    const id = btn.dataset.id; // Keep as string (UUID)
    if (!id) return;

    if (btn.dataset.action === "edit") {
      btn.addEventListener("click", async () => {
        try {
          const tasksNow = await getTasks();
          const task = tasksNow.find((t) => t.id === id);
          if (task) openEditModal(task);
        } catch (err) {
          console.error('Error fetching task for edit', err);
        }
      });
    }

    if (btn.dataset.action === "delete") {
      btn.addEventListener("click", async () => {
        try {
          await deleteTask(id);
          await renderTasks();
        } catch (err) {
          console.error('Error deleting task', err);
        }
      });
    }
  });
}

// --- Open Edit Modal with pre-filled data ---
function openEditModal(task) {
  const modal = document.getElementById("editTaskModal");
  const nameInput = document.getElementById("editModalName");
  const descInput = document.getElementById("editModalDescription");
  const priorityButtons = document.querySelectorAll("#editPriorityGroup button");
  const dateInput = document.getElementById("editModalDate");

  // Pre-fill data
  nameInput.value = task.name;
  descInput.value = task.description;
  if (dateInput) {
    dateInput.value = task.date || new Date().toISOString().split('T')[0];
  }

  // Set priority
  priorityButtons.forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.priority === task.priority) {
      btn.classList.add("active");
    }
  });

  modal.classList.remove("hidden");

  // Store task ID for saving
  modal.dataset.taskId = task.id;
  modal.dataset.isCalendarTask = "false";
}

// --- Setup Edit Modal Listeners ---
function setupEditModalListeners() {
  const editModal = document.getElementById("editTaskModal");
  const closeEditBtn = document.getElementById("closeEditModalBtn");
  const saveEditBtn = document.getElementById("saveEditTaskBtn");
  const editNameInput = document.getElementById("editModalName");
  const editDescInput = document.getElementById("editModalDescription");
  const editDateInput = document.getElementById("editModalDate");
  const editPriorityButtons = document.querySelectorAll("#editPriorityGroup button");

  let selectedEditPriority = "normal";

  // --- Close Edit Modal ---
  closeEditBtn.addEventListener("click", () => {
    editModal.classList.add("hidden");
    editModal.dataset.taskId = "";
    editModal.dataset.isCalendarTask = "false";
  });

  // --- Priority selection in edit modal ---
  editPriorityButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      editPriorityButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedEditPriority = btn.dataset.priority;
    });
  });

  // --- Save edited task ---
  saveEditBtn.addEventListener("click", async () => {
    const taskId = editModal.dataset.taskId; // Keep as string (UUID)
    const isCalendarTask = editModal.dataset.isCalendarTask === "true";
    const newName = editNameInput.value.trim();
    const newDesc = editDescInput.value.trim();

    if (!newName) {
      alert("Task must have a name!");
      return;
    }

    if (!taskId) {
      alert("Task ID not found!");
      return;
    }

    try {
      const updates = {
        name: newName,
        description: newDesc,
        priority: selectedEditPriority,
      };

      if (isCalendarTask && editDateInput) {
        updates.date = editDateInput.value;
      }

      await updateTask(taskId, updates);

      // Refresh appropriate view
      if (isCalendarTask) {
        await updateCalendarTaskPreview();
      } else {
        await renderTasks();
      }

      editModal.classList.add("hidden");
      editModal.dataset.taskId = "";
      editModal.dataset.isCalendarTask = "false";
    } catch (err) {
      console.error('Error saving edited task', err);
      alert('Failed to save task edit.');
    }
  });
}

// --- Inicializace ---
loadPage("chores");

// --- Dark Mode Toggle ---
const darkModeBtn = document.getElementById("darkModeBtn");
darkModeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// --- TC/Bug Modal ---
const tcBugBtn = document.getElementById("tcBugBtn");
const tcBugModal = document.getElementById("tcBugModal");
const closeTcBugBtn = document.getElementById("closeTcBugBtn");

tcBugBtn.addEventListener("click", () => {
  tcBugModal.classList.toggle("hidden");
});

closeTcBugBtn.addEventListener("click", () => {
  tcBugModal.classList.add("hidden");
});

// Close TC/Bug modal when clicking outside (optional)
tcBugModal.addEventListener("click", (e) => {
  if (e.target === tcBugModal) {
    tcBugModal.classList.add("hidden");
  }
});
