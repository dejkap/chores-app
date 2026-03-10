import { MyChores } from "./pages/MyChores.js";
import { Calendar } from "./pages/Calendar.js";
import { Stats } from "./pages/Stats.js";
import { Settings } from "./pages/Settings.js";
import { getTasks, addTask, updateTask, deleteTask } from './supabaseClient.js';

const bugReports = [
  {
    bugId: 'BUG-01',
    title: 'Date persistence failure during Edit',
    severity: 'High',
    priority: 'High',
    description: '1. Edit an existing task in "My Chores".<br>2. Change the date.<br>3. Save.',
    actualVsExpected: 'Actual: Date remains original.<br>Expected: Date should update to the new selection.'
  },
  {
    bugId: 'BUG-02',
    title: 'UI Overflow - Task Description',
    severity: 'Minor',
    priority: 'Medium',
    description: '1. Enter a very long text (200+ chars) into Description.<br>2. View the task in the list.',
    actualVsExpected: 'Actual: Text overflows outside the app container.<br>Expected: Text should wrap within the task card.'
  },
  {
    bugId: 'BUG-03',
    title: 'Race Condition: Duplicate Save',
    severity: 'Medium',
    priority: 'High',
    description: '1. Click the "Save" button rapidly 3-4 times when adding a task.',
    actualVsExpected: 'Actual: Multiple duplicate tasks created with inconsistent priorities.<br>Expected: Only one task should be created.'
  },
  {
    bugId: 'BUG-04',
    title: 'Cross-tab Data Inconsistency',
    severity: 'Medium',
    priority: 'Medium',
    description: '1. Delete task in Tab A.<br>2. Attempt to edit the same task in Tab B.',
    actualVsExpected: 'Actual: Infinite loading spinner; UI hangs.<br>Expected: Error message "Task not found" or automatic refresh.'
  },
  {
    bugId: 'BUG-05',
    title: 'Script Tag Rendering (Ghost Task)',
    severity: 'Minor',
    priority: 'Low',
    description: '1. Enter <script>alert(1)</script> as Task Name.<br>2. View in list.',
    actualVsExpected: 'Actual: Task name is invisible/blank in the list view.<br>Expected: Script should be rendered as plain text.'
  },
  {
    bugId: 'BUG-06',
    title: 'Mobile UI Layout Break',
    severity: 'Medium',
    priority: 'Low',
    description: '1. Open app on a screen width < 768px.<br>2. Open sidebars.',
    actualVsExpected: 'Actual: Elements overlap; "QA Lab" floats over content.<br>Expected: Responsive layout (stacking or hamburger menu).'
  }
];

const app = document.getElementById("app");

// ========== PANEL COLLAPSE/EXPAND FUNCTIONALITY ==========
function setupPanelControls() {
  const leftPanel = document.getElementById('left-panel');
  const rightPanel = document.getElementById('qa-panel');
  const mainWrapper = document.getElementById('mainWrapper');
  const collapseLeftBtn = document.getElementById('collapseLeftBtn');
  const collapseRightBtn = document.getElementById('collapseRightBtn');
  const leftHeader = document.getElementById('leftPanelHeader');
  const rightHeader = document.getElementById('rightPanelHeader');

  // track collapsed state
  let leftCollapsed = false;
  let rightCollapsed = false;
  const leftTab = document.getElementById('leftTab');
  const rightTab = document.getElementById('rightTab');

  function applyGrid() {
    // control widths: when collapsed we set panel width 0 and show tab; when open set open width
    if (leftPanel) leftPanel.style.width = leftCollapsed ? '0px' : '380px';
    if (rightPanel) rightPanel.style.width = rightCollapsed ? '0px' : '380px';
    // tabs visibility
    if (leftTab) leftTab.style.display = leftCollapsed ? 'flex' : 'none';
    if (rightTab) rightTab.style.display = rightCollapsed ? 'flex' : 'none';
  }

  function toggleLeft() {
    leftCollapsed = !leftCollapsed;
    if (leftPanel) leftPanel.classList.toggle('collapsed', leftCollapsed);
    const icon = collapseLeftBtn?.querySelector('.collapse-icon');
    // Left panel: open=‹ (points left/outward), closed => › (points right/inward)
    if (icon) icon.textContent = leftCollapsed ? '›' : '‹';
    // update left tab label arrow (arrow should point left when collapsed)
    if (leftTab) leftTab.innerHTML = leftCollapsed ? '&lt; Documentation' : '';
    applyGrid();
  }

  function toggleRight() {
    rightCollapsed = !rightCollapsed;
    if (rightPanel) rightPanel.classList.toggle('collapsed', rightCollapsed);
    const icon = collapseRightBtn?.querySelector('.collapse-icon');
    // Right panel: open=› (points right/outward), closed => ‹ (points left/inward)
    if (icon) icon.textContent = rightCollapsed ? '‹' : '›';
    if (rightTab) rightTab.innerHTML = rightCollapsed ? 'QA Lab &gt;' : '';
    applyGrid();
  }

  if (collapseLeftBtn) collapseLeftBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleLeft(); });
  if (collapseRightBtn) collapseRightBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleRight(); });
  // tabs click open panels
  if (leftTab) leftTab.addEventListener('click', (e) => { e.stopPropagation(); if (leftCollapsed) toggleLeft(); });
  if (rightTab) rightTab.addEventListener('click', (e) => { e.stopPropagation(); if (rightCollapsed) toggleRight(); });

  // clicking header toggles as well
  if (leftHeader) leftHeader.addEventListener('click', (e) => { if (!e.target.classList.contains('collapse-btn')) toggleLeft(); });
  if (rightHeader) rightHeader.addEventListener('click', (e) => { if (!e.target.classList.contains('collapse-btn')) toggleRight(); });

  // initialize grid
  applyGrid();
}

// ========== DARK MODE TOGGLE ==========
function setupDarkMode() {
  const darkModeBtn = document.getElementById('globalDarkModeBtn') || document.getElementById('darkModeBtn');
  const htmlElement = document.documentElement;

  // Check localStorage for saved preference
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }

  if (darkModeBtn) {
    darkModeBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const newDarkMode = document.body.classList.contains('dark-mode');
      localStorage.setItem('darkMode', newDarkMode);
    });
  }
}

// ========== QA LAB TOGGLE & SCROLL ==========
function setupQALabControls() {
  const qaPanel = document.getElementById('qa-panel');
  const qaCards = document.getElementById('qaCards');
  // If there is a legacy tcBugBtn, make it open/scroll to QA panel
  const tcBugBtn = document.getElementById('tcBugBtn');
  if (tcBugBtn && qaPanel) {
    tcBugBtn.addEventListener('click', () => {
      // Ensure QA panel is expanded
      const collapseRightBtn = document.getElementById('collapseRightBtn');
      if (collapseRightBtn) collapseRightBtn.click();
      qaPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Load QA data from report.md
  loadQAData();

  // Collapsible ticket logic (event delegation): handle tc-card and bug-card via single listener
  if (qaPanel) {
    // initialize toggle glyphs
    qaPanel.querySelectorAll('.tc-toggle, .bug-card .tc-toggle').forEach(t => t.textContent = '▸');

    qaPanel.addEventListener('click', (e) => {
      const header = e.target.closest('.tc-header, .bug-header');
      if (!header) return;
      // prevent toggling when clicking the collapse button in header
      if (e.target.closest && e.target.closest('.collapse-btn')) return;
      const card = header.closest('.tc-card, .bug-card');
      if (!card) return;
      card.classList.toggle('open');
      const toggle = header.querySelector('.tc-toggle');
      if (toggle) toggle.textContent = card.classList.contains('open') ? '▾' : '▸';
    });
  }
}

// ========== LOAD QA DATA FROM REPORT.MD ==========
async function loadQAData() {
  try {
    const response = await fetch('/report.md');
    if (!response.ok) throw new Error('Failed to load report.md');
    const markdown = await response.text();
    const { testCases } = parseReportMarkdown(markdown);
    console.log('Parsed testCases:', testCases);
    renderQAContent(testCases, bugReports);
  } catch (error) {
    console.error('Error loading QA data:', error);
    // Fallback to static content if report.md not found
    renderQAContent([], bugReports);
  }
}

// ========== PARSE REPORT MARKDOWN ==========
function parseReportMarkdown(markdown) {
  const lines = markdown.split('\n');
  const testCases = [];
  const bugs = [];
  let currentSection = '';
  let tableHeaders = [];
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('| ID & Title') || line.startsWith('| Bug ID')) {
      tableHeaders = line.split('|').slice(1, -1).map(h => h.trim());
      inTable = true;
      currentSection = line.includes('Bug ID') ? 'bugs' : 'testcases';
      continue;
    }

    if (line.startsWith('| ---') && inTable) {
      continue; // Skip separator
    }

    if (line.startsWith('|') && inTable && !line.startsWith('| ---') && !line.includes('NEGATIVE') && !line.includes('EDGE')) {
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (cells.length >= tableHeaders.length && cells[0]) {
        // remove any markdown asterisks around the ID cell
        let raw = cells[0].replace(/\*/g, '').trim();
        if (/^TC-?\d+/i.test(raw)) {
          if (currentSection === 'testcases') {
            const match = raw.match(/^(TC-?\d+)\s+–\s+(.+)$/i);
            let id = match ? match[1] : raw;
            // normalise to TC-XX with two digits
            id = id.toUpperCase().replace(/^TC-?(\d{1,2})$/, (m,p)=>`TC-${p.padStart(2,'0')}`);
            const title = match ? match[2] : '';
            testCases.push({
              id,
              title,
              preConditions: cells[1] || '',
              testSteps: cells[2] || '',
              expectedResult: cells[3] || '',
              status: cells[4] || '',
              defectId: cells[5] || ''
            });
          }
        } else if (/^BUG-?\d+/i.test(raw)) {
          if (currentSection === 'bugs') {
            let bugId = raw.toUpperCase().replace(/^BUG-?(\d{1,2})$/, (m,p)=>`BUG-${p.padStart(2,'0')}`);
            bugs.push({
              bugId,
              title: cells[1] || '',
              severity: cells[2] || '',
              priority: cells[3] || '',
              description: cells[4] || '',
              actualVsExpected: cells[5] || ''
            });
          }
        }
      }
    }

    if (line === '' && inTable) {
      inTable = false;
    }
  }

  return { testCases, bugs };
}

// ========== RENDER QA CONTENT ==========
function renderQAContent(testCases, bugs) {
  const qaPanelContent = document.getElementById('qaPanelContent');
  if (!qaPanelContent) return;

  // Calculate statistics
  const totalTC = 26;
  const passCount = 18;
  const failCount = 8;
  const bugCount = 6;

  // Group test cases by type
  const happyPath = testCases.filter(tc => {
    // remove all non-digit characters (handles TC-01 format)
    const num = parseInt(tc.id.replace(/[^0-9]/g, ''));
    return num >= 1 && num <= 14;
  });
  const negative = testCases.filter(tc => {
    const num = parseInt(tc.id.replace(/[^0-9]/g, ''));
    return num >= 17 && num <= 20;
  });
  const edge = testCases.filter(tc => {
    const num = parseInt(tc.id.replace(/[^0-9]/g, ''));
    return num === 15 || num === 16 || (num >= 21 && num <= 26);
  });

  // Render content
  qaPanelContent.innerHTML = `
    <div class="qa-dashboard">
      <div class="dashboard-item">
        <span class="dashboard-value">${totalTC}</span>
        <span class="dashboard-label">TC</span>
      </div>
      <div class="dashboard-item">
        <span class="dashboard-value pass">${passCount}</span>
        <span class="dashboard-label">Pass</span>
      </div>
      <div class="dashboard-item">
        <span class="dashboard-value fail">${failCount}</span>
        <span class="dashboard-label">Fail/Issue</span>
      </div>
      <div class="dashboard-item">
        <span class="dashboard-value">${bugCount}</span>
        <span class="dashboard-label">Bugs</span>
      </div>
    </div>

    <div class="qa-header">
      <div class="execution-summary">
        <h3>📋 Execution Summary</h3>
        <p><strong>Tester:</strong> Jan</p>
        <p><strong>Date:</strong> March 2026</p>
        <p><strong>App URL:</strong> https://chores-app-omega.vercel.app</p>
        <p><strong>Testing Scope:</strong> Functional, UI/UX, Edge Cases, Data Integrity.</p>
      </div>
      <div class="test-environment">
        <h3>💻 Test Environment</h3>
        <p><strong>Operating System:</strong> Windows 11</p>
        <p><strong>Primary Browsers:</strong> Google Chrome (v122+), Vivaldi (v6.6+)</p>
        <p><strong>Mobile Testing:</strong> Chrome DevTools (iPhone 13 & Pixel 7 emulation)</p>
      </div>
    </div>

    <button id="exportReportBtn" class="export-btn">Export Report</button>

    <div class="qa-accordion">
      <div class="accordion-section">
        <div class="accordion-header">
          <span>Happy Path (${happyPath.length})</span>
          <span class="toggle-icon">▶</span>
        </div>
        <div class="accordion-content">
          ${renderTestCases(happyPath)}
        </div>
      </div>

      <div class="accordion-section">
        <div class="accordion-header">
          <span>Negative Path (${negative.length})</span>
          <span class="toggle-icon">▶</span>
        </div>
        <div class="accordion-content">
          ${renderTestCases(negative)}
        </div>
      </div>

      <div class="accordion-section">
        <div class="accordion-header">
          <span>Edge Cases (${edge.length})</span>
          <span class="toggle-icon">▶</span>
        </div>
        <div class="accordion-content">
          ${renderTestCases(edge)}
        </div>
      </div>

      <div class="accordion-section">
        <div class="accordion-header">
          <span>Defect Log (${bugs.length})</span>
          <!-- start expanded since content is visible; use consistent ▶ icon rotated via expanded class -->
          <span class="toggle-icon expanded">▶</span>
        </div>
        <div class="accordion-content" style="display: block;">
          <div class="defect-legend">
            <h4>Key: Severity & Priority</h4>
            <div class="legend-row">
              <span>Severity:</span>
              <span class="bug-badge severity-high">High</span>
              <span class="bug-badge severity-medium">Medium</span>
              <span class="bug-badge severity-minor">Minor</span>
            </div>
            <div class="legend-row">
              <span>Priority:</span>
              <span class="bug-badge priority-high">High</span>
              <span class="bug-badge priority-medium">Medium</span>
              <span class="bug-badge priority-low">Low</span>
            </div>
            <p class="legend-description"><em>Severity measures the technical impact, while Priority defines the repair urgency.</em></p>
          </div>
          ${renderBugs(bugs)}
        </div>
      </div>
    </div>
  `;

  // Setup accordion functionality
  setupAccordion();

  // Setup export button
  setupExportButton();
}

// ========== RENDER TEST CASES ==========
function renderTestCases(testCases) {
  return testCases.map(tc => `
    <div class="tc-item">
      <div class="tc-summary" data-id="${tc.id}">
        <span class="tc-id">${tc.id}</span>
        <span class="tc-title">${tc.title}</span>
        <div class="tc-badges">
          <span class="tc-status ${tc.status.startsWith('PASS') ? 'pass' : 'fail'}">${tc.status.startsWith('PASS') ? 'PASS' : 'FAIL'}</span>
          ${tc.defectId ? `<span class="tc-defect" data-bug-id="${tc.defectId}">${tc.defectId}</span>` : ''}
        </div>
        <span class="tc-toggle">▶</span>
      </div>
      <div class="tc-details">
        <div class="tc-preconditions"><strong>Pre-conditions:</strong> ${tc.preConditions}</div>
        <div class="tc-steps"><strong>Test Steps:</strong> ${tc.testSteps.replace(/<br>/g, '<br>')}</div>
        <div class="tc-expected"><strong>Expected Result:</strong> ${tc.expectedResult}</div>
        ${tc.status.includes('–') ? `<div class="tc-status-detail"><strong>Status Detail:</strong> ${tc.status}</div>` : ''}
      </div>
    </div>
  `).join('');
}

// ========== RENDER BUGS ==========
function renderBugs(bugs) {
  return bugs.map(bug => `
    <div class="tc-item bug-item" id="bug-${bug.bugId}">
      <div class="tc-summary bug-summary" data-id="${bug.bugId}">
        <span class="tc-id">${bug.bugId}</span>
        <div class="tc-badges">
          <span class="bug-badge severity-${bug.severity.toLowerCase()}">${bug.severity}</span>
          <span class="bug-badge priority-${bug.priority.toLowerCase()}">${bug.priority}</span>
        </div>
        <span class="tc-toggle">▶</span>
      </div>
      <div class="bug-details">
        <div class="bug-title-full"><strong>${bug.title}</strong></div>
        <div class="bug-description">${bug.description}</div>
        <div class="bug-expected"><strong>Expected:</strong> ${bug.actualVsExpected.split('<br>Expected: ')[1] || 'N/A'}</div>
        <div class="bug-actual"><strong>Actual:</strong> ${bug.actualVsExpected.split('<br>Expected: ')[0].replace('Actual: ', '')}</div>
      </div>
    </div>
  `).join('');
}

// ========== GET SEVERITY ICON ==========
function getSeverityIcon(severity) {
  switch (severity.toLowerCase()) {
    case 'high': return '🔴';
    case 'medium': return '🟠';
    case 'low': return '🔵';
    default: return '⚪';
  }
}

// ========== SETUP ACCORDION ==========
function setupAccordion() {
  const TC_ID_COLUMN_WIDTH = 55;

  function updateTcHeaderLayout(summary) {
    const details = summary.nextElementSibling;
    const isExpanded = details && details.style.display === 'block';

    // Defect Log headers stay locked to one row.
    if (summary.classList.contains('bug-summary')) {
      summary.classList.remove('stack-badges');
      return;
    }

    if (!isExpanded) {
      summary.classList.remove('stack-badges');
      return;
    }

    const statusEl = summary.querySelector('.tc-status');
    const hasFailStatus = !!statusEl && statusEl.classList.contains('fail');
    const hasLinkedDefect = !!summary.querySelector('.tc-defect');

    const titleEl = summary.querySelector('.tc-title');
    const badgesEl = summary.querySelector('.tc-badges');
    const toggleEl = summary.querySelector('.tc-toggle');

    let titleTooLongForSingleLine = false;
    if (titleEl && badgesEl && toggleEl) {
      const computed = window.getComputedStyle(summary);
      const paddingLeft = parseFloat(computed.paddingLeft) || 0;
      const paddingRight = parseFloat(computed.paddingRight) || 0;
      const gap = parseFloat(computed.columnGap || computed.gap) || 10;

      const availableWidth = summary.clientWidth - paddingLeft - paddingRight;
      const requiredWidth =
        TC_ID_COLUMN_WIDTH +
        gap +
        titleEl.scrollWidth +
        gap +
        badgesEl.scrollWidth +
        gap +
        toggleEl.offsetWidth;

      titleTooLongForSingleLine = requiredWidth > availableWidth;
    }

    const shouldStackBadges = hasFailStatus || hasLinkedDefect || titleTooLongForSingleLine;
    summary.classList.toggle('stack-badges', shouldStackBadges);
  }

  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const content = header.nextElementSibling;
      const icon = header.querySelector('.toggle-icon');
      const isOpen = content.style.display === 'block';

      content.style.display = isOpen ? 'none' : 'block';
      if (isOpen) {
        icon.classList.remove('expanded');
      } else {
        icon.classList.add('expanded');
      }
    });
  });

  // Setup test case details toggle (exclude bug rows to avoid double handlers)
  document.querySelectorAll('.tc-summary:not(.bug-summary)').forEach(summary => {
    summary.addEventListener('click', () => {
      const details = summary.nextElementSibling;
      const toggle = summary.querySelector('.tc-toggle');
      const isOpen = details.style.display === 'block';

      details.style.display = isOpen ? 'none' : 'block';
      summary.classList.toggle('expanded', !isOpen);
      if (isOpen) {
        toggle.classList.remove('expanded');
      } else {
        toggle.classList.add('expanded');
      }

      updateTcHeaderLayout(summary);
    });
  });

  // Setup bug details toggle (same behavior as test cases)
  document.querySelectorAll('.bug-summary').forEach(summary => {
    summary.addEventListener('click', () => {
      const details = summary.nextElementSibling;
      const toggle = summary.querySelector('.tc-toggle');
      const isOpen = details.style.display === 'block';

      details.style.display = isOpen ? 'none' : 'block';
      summary.classList.toggle('expanded', !isOpen);
      if (toggle) {
        if (isOpen) toggle.classList.remove('expanded');
        else toggle.classList.add('expanded');
      }

      updateTcHeaderLayout(summary);
    });
  });

  // Keep TC stacking adaptive when viewport width changes.
  window.addEventListener('resize', () => {
    document.querySelectorAll('.tc-summary.expanded').forEach(updateTcHeaderLayout);
  });

  // Setup defect link to bug
  document.querySelectorAll('.tc-defect').forEach(defect => {
    defect.addEventListener('click', () => {
      const bugId = defect.dataset.bugId;
      const bugElement = document.getElementById(`bug-${bugId}`);
      if (bugElement) {
        // Ensure Defect Log is expanded
        const defectLogHeader = document.querySelector('.accordion-header:has(span:contains("Defect Log"))');
        if (defectLogHeader) {
          const content = defectLogHeader.nextElementSibling;
          if (content.style.display !== 'block') {
            content.style.display = 'block';
            defectLogHeader.querySelector('.toggle-icon').classList.add('expanded');
          }
        }
        // Scroll to bug
        bugElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Expand bug if not expanded
        const bugDetails = bugElement.querySelector('.bug-details');
        if (bugDetails && bugDetails.style.display !== 'block') {
          bugDetails.style.display = 'block';
          const bugSummary = bugElement.querySelector('.tc-summary');
          bugSummary.classList.add('expanded');
          const toggle = bugElement.querySelector('.tc-toggle');
          if (toggle) toggle.classList.add('expanded');
          updateTcHeaderLayout(bugSummary);
        }
      }
    });
  });
}

// ========== SETUP EXPORT BUTTON ==========
function setupExportButton() {
  const exportBtn = document.getElementById('exportReportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      try {
        const response = await fetch('/report.md');
        if (!response.ok) throw new Error('Failed to load report.md');
        const content = await response.text();

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'report.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error exporting report:', error);
        alert('Failed to export report');
      }
    });
  }
}

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

// --- Validation helpers ---
function validateFieldLengths(name, description) {
  if (name.length > 50) return { ok: false, message: 'Task name must be at most 50 characters.' };
  if (description.length > 200) return { ok: false, message: 'Description must be at most 200 characters.' };
  return { ok: true };
}

/**
 * Validate before adding a task.
 * If ignoreTaskId is provided, that task is excluded from counts (useful for edits).
 */
async function validateBeforeAdd(name, description, date, ignoreTaskId = null) {
  // Field lengths
  const fld = validateFieldLengths(name, description);
  if (!fld.ok) return fld;

  // Fetch tasks once
  const tasks = await getTasks();

  // Total limit applies only when adding a new task (ignoreTaskId == null)
  if (!ignoreTaskId) {
    if (tasks.length >= 200) return { ok: false, message: 'Total task limit reached (200). Please delete some tasks before adding more.' };
  }

  // Daily limit: count tasks for the date, excluding ignoreTaskId
  const dailyCount = tasks.filter((t) => t.date === date && String(t.id) !== String(ignoreTaskId)).length;
  if (dailyCount >= 20) return { ok: false, message: `Daily task limit reached (20) for ${date}.` };

  return { ok: true };
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

    // Validate before adding
    const valid = await validateBeforeAdd(name, description, date, null);
    if (!valid.ok) {
      alert(valid.message);
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

  // scroll the active year into the middle of the list for better visibility
  const activeYearBtn = yearList.querySelector('button.active');
  if (activeYearBtn) {
    // use a small timeout to ensure element is in DOM and layout done
    setTimeout(() => {
      activeYearBtn.scrollIntoView({ block: 'center' });
    }, 0);
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

    // Validate before adding (for calendar modal)
    const valid = await validateBeforeAdd(name, description, date, null);
    if (!valid.ok) {
      alert(valid.message);
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
      const taskId = btn.dataset.id; // Keep as string (UUID)
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
      const taskId = btn.dataset.id; // Keep as string (UUID)
      if (!taskId) return;
      try {
        await deleteTask(taskId);
        await updateCalendarTaskPreview();
      } catch (err) {
        console.error('Error deleting task', err);
      }
    });
  });

  // Done Calendar Tasks
  document.querySelectorAll(".calendar-task-done").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const taskId = btn.dataset.id;
      if (!taskId) return;
      try {
        const tasks = await getTasks();
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return;
        await updateTask(taskId, { done: !task.done });
        await updateCalendarTaskPreview();
      } catch (err) {
        console.error('Error toggling done for calendar task', err);
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
            <button class="task-action-icon calendar-task-done" data-id="${t.id}" title="Mark done">${t.done ? '✅' : '✔️'}</button>
            <div class="calendar-task-content">
              <strong>${t.name}</strong>
              ${t.description ? `<small>${t.description}</small>` : ''}
            </div>
            <div class="task-actions">
              <button class="task-action-icon calendar-task-edit" data-id="${t.id}" title="Edit task">✏️</button>
              <button class="task-action-icon calendar-task-delete" data-id="${t.id}" title="Delete task">🗑️</button>
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

  // Initialize currentDate from sessionStorage (set by MyChores.js on first load)
  // If sessionStorage doesn't have it, MyChores.js should have already set it
  const stored = sessionStorage.getItem("selectedDate");
  let currentDate = stored ? new Date(stored + "T00:00:00") : new Date();

  const updateDisplay = () => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
    // Save to sessionStorage so navigation state persists during the session
    sessionStorage.setItem("selectedDate", dateStr);
    if (dayPicker) dayPicker.value = dateStr;
    if (dateDisplayText) dateDisplayText.textContent = currentDate.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
    renderTasks();
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      // compute new date from current state and save to sessionStorage
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1);
      updateDisplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
      updateDisplay();
    });
  }

  if (dayPicker) {
    dayPicker.addEventListener("change", (e) => {
      // parse yyyy-mm-dd from input reliably as local date and save to sessionStorage
      currentDate = new Date(e.target.value + "T00:00:00");
      updateDisplay();
    });
  }

  // ensure display is initialized on setup
  updateDisplay();
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

  // Get current date for filtering: read from sessionStorage if set (by date navigation),
  // otherwise use today's date. sessionStorage is set by MyChores.js on init and
  // setupMyChoresDateNavigation on navigation.
  const storedDate = sessionStorage.getItem("selectedDate");
  const currentDate = storedDate ? new Date(storedDate + "T00:00:00") : new Date();
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
    <div class="card">
      <div style="display:flex; align-items:flex-start; gap:8px;">
        <button class="task-action-icon done-button" data-action="done" data-id="${t.id}" title="Mark done">${t.done ? '✅' : '✔️'}</button>
        <div>
          <strong style="${t.done ? "text-decoration: line-through; color:green" : ""}">${t.name}</strong>
          <small>Description: ${t.description}</small>
          <small>Priority: ${t.priority}</small>
        </div>
      </div>
      <div class="task-actions">
        <button class="task-action-icon" data-action="edit" data-id="${t.id}" title="Edit task">✏️</button>
        <button class="task-action-icon" data-action="delete" data-id="${t.id}" title="Delete task">🗑️</button>
      </div>
    </div>
  `;

  // Build HTML
  let html = '';

  // Sort dropdown
  html += `
    <div class="sort-container">
      <label for="sortDropdown" class="sort-label">Sort by:</label>
      <select id="sortDropdown" class="sort-dropdown">
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

  // --- Done button listeners are handled below with other buttons ---

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

    if (btn.dataset.action === "done") {
      btn.addEventListener("click", async () => {
        try {
          const tasksNow = await getTasks();
          const task = tasksNow.find((t) => t.id === id);
          if (!task) return;
          await updateTask(id, { done: !task.done });
          await renderTasks();
        } catch (err) {
          console.error('Error toggling done', err);
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
    // Validate field lengths
    const fld = validateFieldLengths(newName, newDesc);
    if (!fld.ok) {
      alert(fld.message);
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

        // If date changed, ensure daily limit not exceeded (exclude this task)
        const tasks = await getTasks();
        const current = tasks.find((t) => String(t.id) === String(taskId));
        const newDate = updates.date;
        if (current && current.date !== newDate) {
          const dailyCount = tasks.filter((t) => t.date === newDate && String(t.id) !== String(taskId)).length;
          if (dailyCount >= 20) {
            alert(`Daily task limit reached (20) for ${newDate}.`);
            return;
          }
        }
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

// Set the current date on app load
const today = new Date();
const sharedState = { selectedDate: today };

// Initialize the application
setupPanelControls();
setupDarkMode();
setupQALabControls();
loadPage("chores");
