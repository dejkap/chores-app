# QA Test Report: Chores App

## 📋 Execution Summary
- **Tester:** Jan Přikryl
- **Date:** March 2026
- **App URL:** https://chores-app-omega.vercel.app
- **Testing Scope:** Functional, UI/UX, Edge Cases, Data Integrity.

## 💻 Test Environment
- **Operating System:** Windows 11
- **Primary Browsers:** Google Chrome (v122+), Vivaldi (v6.6+)
- **Mobile Testing:** Chrome DevTools (iPhone 13 & Pixel 7 emulation)

| ID & Title | Pre-conditions | Test Steps | Expected Result | Status | Defect ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| TC-01 – Add Task (My Chores) | User is on the "My Chores" tab. | 1. Click "Add Task".<br>2. Enter Name, Description, set Priority to High, and select today's date.<br>3. Click "Save". | The task is created with correct data and is visible in the list for the selected day. | PASS | |
| TC-02 – Add Task (Calendar) | User is on the "Calendar" tab. | 1. Select a specific date (e.g., Feb 19, 2026).<br>2. Click "Add Task for This Date".<br>3. Fill in details and click "Save". | The task is successfully saved for the chosen date and appears in both Calendar and My Chores views. | PASS | |
| TC-03 – Input Validation (Emojis/URLs) | User is in the "Add Task" modal. | 1. Enter emojis (e.g., "🤗🫠🤩") or a URL into the title field.<br>2. Click "Save". | Application handles special characters/links gracefully without crashing; text displays correctly on the task card. | PASS | |
| TC-04 – Edit Task (My Chores) | An existing task exists; User is in the "My Chores" tab. | 1. Click the "Edit" (pencil) icon.<br>2. Change Name, Description, Priority, and Date.<br>3. Click "Save". | Task updates successfully with all changes, including the new date. | FAIL – Name/Desc/Priority update, but the date remains unchanged. | BUG-01 |
| TC-05 – Edit Task (Calendar) | An existing task exists; User is on the "Calendar" tab. | 1. Click the "Edit" (pencil) icon.<br>2. Change Name, Description, Priority, and Date (e.g., Feb 13 -> Feb 14). <br>3. Click "Save". | Task updates successfully. Unlike MyChores, the date change is correctly reflected and saved. | PASS | |
| TC-06 – Priority Sorting | User is on My Chores or Calendar tab. | 1. Create three tasks with different priorities (Low, Normal, High).<br>2. Check the order and visual representation. | Each task displays the correct color/icon, and they are sorted according to priority level. | PASS | |
| TC-07 – Calendar Navigation | User is on the "Calendar" tab. | 1. Click the "Next" (→) and "Previous" (←) arrows near the month name.<br>2. Select a specific day (e.g., Feb 14). | The calendar correctly switches months and updates the "Selected date" text below the grid. | PASS | |
| TC-08 – Calendar Activity Indicators | Tasks exist on some dates; other dates are empty. | 1. Navigate to a month with tasks.<br>2. Observe the visual style of days with vs. without tasks. | Days with tasks should have a visual indicator (e.g., a dot or highlight). | NOT IMPLEMENTED (Mark as Known Issue) | |
| TC-09 – Date Persistence (Session) | User is on "My Chores" tab. | 1. Click "Next Day" arrow.<br>2. Verify date change.<br>3. Refresh page (F5). | Selected date remains unchanged after refresh within the same session. | PASS | |
| TC-10 – Statistics (Empty State) | Application has no tasks (fresh start or after Clear All). | 1. Navigate to the "Stats" tab. | All counters (To-Do, Completed, Total) show "0". UI does not break. | PASS | |
| TC-11 – Statistics (Dynamic Updates) | User has the "Stats" tab open. | 1. Create a new task.<br>2. Return to Stats.<br>3. Mark task as Done and return to Stats. | Counters increment and decrement correctly based on task status changes. | PASS | |
| TC-12 – Export Tasks | User is on the "Settings" tab. | 1. Click the "Export Tasks" button.<br>2. Save the prompted file. | A .json file containing all task data is successfully downloaded. | PASS | |
| TC-13 – Clear All Tasks | Existing tasks are present in the database. | 1. Go to "Settings" and click "Clear All Tasks".<br>2. Verify "My Chores" and "Stats" tabs. | All tasks are permanently deleted; list is empty and Statistics are reset to 0. | PASS | |
| TC-14 – Settings Persistence | User is on "Settings" tab. | 1. Toggle "Enable Notifications" to ON.<br>2. Navigate to "Stats" and back to "Settings". | The toggle remains in the "ON" position (state is saved in localStorage). | PASS | |
| TC-15 – Visual & UX (Responzivity) | App is open in a browser. | 1. Manually resize the window or use DevTools to simulate mobile view. | UI elements (Documentation, QA Lab) should adapt or stack correctly. | FAIL – Side panels float incorrectly; app is difficult to use on small screens. | BUG-06 |
| TC-16 – Mobile Responsiveness | App is open on a mobile-sized screen (or via DevTools). | 1. Navigate through all tabs (My Chores, Calendar, Stats, Settings).<br>2. Check for overlapping elements. | UI elements should be fully accessible and correctly placed on all screen sizes. | FAIL – Significant issues on mobile; sidebars (QA Lab/Doc) float incorrectly and elements overlap. | BUG-06 |
| NEGATIVE | | | | | |
| TC-17 – Required Field (Empty Title) | User is in the "Add Task" modal. | 1. Leave the "Task Name" field empty.<br>2. Click "Save". | A warning message appears stating that the Title is mandatory; task is not saved. | PASS | |
| TC-18 – Past Date Selection | User is in the "Add Task" modal. | 1. Select a date in the past (e.g., Dec 24, 2025).<br>2. Fill in the title and click "Save". | Application allows creating tasks in the past; task is visible on the selected date. | PASS | |
| TC-19 – Rapid Click "Save" Spam | User is in the "Add Task" modal with valid data. | 1. Click the "Save" button multiple times in rapid succession. | Only one instance of the task is created in the database. | FAIL – Task is created 3-4 times; duplicates often have downgraded priority (e.g., High becomes Normal). | BUG-03 |
| TC-20 – Empty Name on Edit | A task already exists. | 1. Click "Edit" on a task.<br>2. Clear the "Task Name" field.<br>3. Click "Save". | Validation should prevent saving and display an error message. | PASS – Validation works; "Task must have a name!" message appears. | |
| EDGE | | | | | |
| TC-21 – Max Character Limits | User is in the "Add Task" modal. | 1. Enter 50+ characters in Name and 200+ in Description.<br>2. Click "Save". | UI handles long text gracefully (wrapping). | FAIL – Text does not wrap and overflows "into the background" outside the app UI. | BUG-02 |
| TC-22 – Leap Year Handling | User is on the "Calendar" tab. | 1. Navigate to February 2028. | February 29th is displayed correctly and allows task creation. | PASS | |
| TC-23 – Stats Sync after Clear All | Existing tasks present; Stats show non-zero values. | 1. Go to Settings and click "Clear All Tasks".<br>2. Navigate to the "Stats" tab. | All tasks are deleted, and all Statistic counters (To-Do, Completed, Total) are reset to 0. | PASS | |
| TC-24 – Cancel/Dismiss Modal | User is in the "Add Task" modal with data filled in. | 1. Click the "Cancel" button or click outside the modal (if supported). | Modal closes; no data is saved to the database or displayed in the list. | PASS | |
| TC-25 – Script Injection | User is in "Add Task" modal. | 1. Enter <script>alert(1)</script> into the Name field.<br>2. Click "Save". | App should sanitize input; text should be rendered as plain text, not executed. | PARTIAL PASS / UI BUG – Script didn't execute, but task became "invisible" in the list (though visible in Edit mode). | BUG-05 |
| TC-26 – Cross-tab Synchronization | App is open in two different browser tabs. | 1. Delete a task in Tab A.<br>2. Try to edit the same task in Tab B (without refreshing). | App should handle the missing data gracefully (e.g., show an error or auto-sync). | FAIL – Tab B shows outdated data; editing causes an infinite loading spinner with no error message. | BUG-04 |

| Bug ID | Title (Summary) | Severity | Priority | Description / Steps to Reproduce | Actual vs. Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| BUG-01 | Date persistence failure during Edit | High | High | 1. Edit an existing task in "My Chores".<br>2. Change the date.<br>3. Save. | Actual: Date remains original.<br>Expected: Date should update to the new selection. |
| BUG-02 | UI Overflow - Task Description | Low | Medium | 1. Enter a very long text (200+ chars) into Description.<br>2. View the task in the list. | Actual: Text overflows outside the app container.<br>Expected: Text should wrap within the task card. |
| BUG-03 | Race Condition: Duplicate Save | Medium | High | 1. Click the "Save" button rapidly 3-4 times when adding a task. | Actual: Multiple duplicate tasks created with inconsistent priorities.<br>Expected: Only one task should be created. |
| BUG-04 | Cross-tab Data Inconsistency | Medium | Medium | 1. Delete task in Tab A.<br>2. Attempt to edit the same task in Tab B. | Actual: Infinite loading spinner; UI hangs.<br>Expected: Error message "Task not found" or automatic refresh. |
| BUG-05 | Script Tag Rendering (Ghost Task) | Minor | Low | 1. Enter <script>alert(1)</script> as Task Name.<br>2. View in list. | Actual: Task name is invisible/blank in the list view.<br>Expected: Script should be rendered as plain text. |
| BUG-06 | Mobile UI Layout Break | Medium | Low | 1. Open app on a screen width < 768px.<br>2. Open sidebars. | Actual: Elements overlap; "QA Lab" floats over content.<br>Expected: Responsive layout (stacking or hamburger menu). |
