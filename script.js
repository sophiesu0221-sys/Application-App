const startButton = document.getElementById("StartButton");

const welcomeScreen = document.getElementById("welcome-screen");
const trackerScreen = document.getElementById("tracker-screen");

startButton.addEventListener("click", function () {
    welcomeScreen.hidden = true;
    trackerScreen.hidden = false;
});


// Make sticky notes draggable

const notes = document.querySelectorAll(".sticky-note");
const board = document.querySelector(".board");

notes.forEach(function (note) {
    const handle = note.querySelector(".drag-handle");


    const textarea = note.querySelector("textarea");
    const storageKey = "sticky-" + note.id;

    // Restore saved note
    const saved = JSON.parse(localStorage.getItem(storageKey) || "null");

    if (saved) {
        textarea.value = saved.text || "";
        note.style.left = saved.left;
        note.style.top = saved.top;
        note.style.right = "auto";
    }

    // Save note text and position
    function saveNote() {
        localStorage.setItem(storageKey, JSON.stringify({
            text: textarea.value,
            left: note.style.left || getComputedStyle(note).left,
            top: note.style.top || getComputedStyle(note).top
        }));
    }

    // Automatically save whenever you type
    textarea.addEventListener("input", saveNote);


    handle.addEventListener("pointerdown", function (event) {
        if (event.button !== 0) return;

        event.preventDefault();

        const noteRect = note.getBoundingClientRect();
        const boardRect = board.getBoundingClientRect();

        const offsetX = event.clientX - noteRect.left;
        const offsetY = event.clientY - noteRect.top;

        handle.setPointerCapture(event.pointerId);

        function moveNote(event) {
            const x = event.clientX - boardRect.left - offsetX;
            const y = event.clientY - boardRect.top - offsetY;

            const maxX = board.clientWidth - note.offsetWidth;
            const maxY = board.clientHeight - note.offsetHeight;

            note.style.left = Math.max(0, Math.min(x, maxX)) + "px";
            note.style.top = Math.max(0, Math.min(y, maxY)) + "px";

            note.style.right = "auto";
        }


        function stopDragging() {
            handle.removeEventListener("pointermove", moveNote);
            handle.removeEventListener("pointerup", stopDragging);
            handle.removeEventListener("pointercancel", stopDragging);

            saveNote();
        }


        handle.addEventListener("pointermove", moveNote);
        handle.addEventListener("pointerup", stopDragging);
        handle.addEventListener("pointercancel", stopDragging);
    });
});

// CALENDAR

const calendarGrid = document.getElementById("calendar-grid");
const calendarMonth = document.getElementById("calendar-month");

const previousMonth = document.getElementById("previous-month");
const nextMonth = document.getElementById("next-month");

// Start with the current month
let currentDate = new Date();

// Display the calendar
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Display month and year
  calendarMonth.textContent = currentDate.toLocaleString("en-US", {
    month: "long",
    year: "numeric"
  });

  // Clear previous calendar dates
  calendarGrid.innerHTML = "";

  // Create weekday headings
  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

  weekdays.forEach(function(day) {
    const dayElement = document.createElement("div");
    dayElement.classList.add("calendar-day", "weekday");
    dayElement.textContent = day;

    // Show application details when hovering over a date
    if (dayElement.title) {
      dayElement.classList.add("has-event");

      dayElement.addEventListener("mouseenter", function() {
        const tooltip = document.getElementById("calendar-tooltip");
        tooltip.textContent = dayElement.title;
        tooltip.hidden = false;
      });

      dayElement.addEventListener("mouseleave", function() {
        document.getElementById("calendar-tooltip").hidden = true;
      });
    }

    calendarGrid.appendChild(dayElement);
  });

  // Determine the first day of the month
  const firstDay = new Date(year, month, 1).getDay();

  // Convert Sunday-first to Monday-first
  const startingDay = (firstDay + 6) % 7;

  // Number of days in this month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Add empty spaces before the first day
  for (let i = 0; i < startingDay; i++) {
    const emptyDay = document.createElement("div");
    calendarGrid.appendChild(emptyDay);
  }

  // Create the numbered days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement("div");

    dayElement.classList.add("calendar-day");
    dayElement.textContent = day;

    // Check whether any applications have dates on this day
    const dateString =
      year + "-" +
      String(month + 1).padStart(2, "0") + "-" +
      String(day).padStart(2, "0");

    applications.forEach(function(application) {
      if (application.openDate === dateString) {
        dayElement.classList.add("application-opening");
        dayElement.title += "○ Opens: " + application.company + "\n";
      }

      if (application.deadline === dateString) {
        dayElement.classList.add("application-deadline");
        dayElement.title += "✳ Deadline: " + application.company + "\n";
      }
    });


    // Highlight today's date
    const today = new Date();

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      dayElement.classList.add("today");
    }

    calendarGrid.appendChild(dayElement);
  }
}

// Previous month button
previousMonth.addEventListener("click", function() {
  currentDate.setDate(1);
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

// Next month button
nextMonth.addEventListener("click", function() {
  currentDate.setDate(1);
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});



// DRAGGABLE CALENDAR

const calendarWidget = document.getElementById("calendar-widget");
const calendarHandle = calendarWidget.querySelector(".calendar-header");

// Restore saved position
const savedCalendar = JSON.parse(
  localStorage.getItem("calendar-position") || "null"
);

if (savedCalendar) {
  calendarWidget.style.left = savedCalendar.left;
  calendarWidget.style.top = savedCalendar.top;
}

calendarHandle.addEventListener("pointerdown", function(event) {
  if (event.button !== 0) return;

  event.preventDefault();

  const calendarRect = calendarWidget.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();

  const offsetX = event.clientX - calendarRect.left;
  const offsetY = event.clientY - calendarRect.top;

  calendarHandle.setPointerCapture(event.pointerId);

  function moveCalendar(event) {
    const x = event.clientX - boardRect.left - offsetX;
    const y = event.clientY - boardRect.top - offsetY;

    const maxX = Math.max(0, board.clientWidth - calendarWidget.offsetWidth);
    const maxY = Math.max(0, board.clientHeight - calendarWidget.offsetHeight);

    calendarWidget.style.left = Math.max(0, Math.min(x, maxX)) + "px";
    calendarWidget.style.top = Math.max(0, Math.min(y, maxY)) + "px";
  }

  function stopDragging() {
    calendarHandle.removeEventListener("pointermove", moveCalendar);
    calendarHandle.removeEventListener("pointerup", stopDragging);
    calendarHandle.removeEventListener("pointercancel", stopDragging);

    localStorage.setItem("calendar-position", JSON.stringify({
      left: calendarWidget.style.left,
      top: calendarWidget.style.top
    }));
  }

  calendarHandle.addEventListener("pointermove", moveCalendar);
  calendarHandle.addEventListener("pointerup", stopDragging);
  calendarHandle.addEventListener("pointercancel", stopDragging);
});

// MATERIALS FOLDER NAVIGATION

const materialsFolder = document.querySelector(".materials-folder");
const materialsScreen = document.getElementById("materials-screen");
const backButton = document.querySelector(".back-button");

// Open Materials
materialsFolder.addEventListener("click", function() {
  trackerScreen.hidden = true;
  materialsScreen.hidden = false;
});

// Return to the board
backButton.addEventListener("click", function() {
  materialsScreen.hidden = true;
  trackerScreen.hidden = false;
});


// APPLICATIONS FOLDER NAVIGATION

const applicationsFolder = document.querySelector(".applications-folder");
const applicationsScreen = document.getElementById("applications-screen");
const backToBoard = document.getElementById("back-to-board");

// Open Applications
applicationsFolder.addEventListener("click", function() {
  trackerScreen.hidden = true;
  applicationsScreen.hidden = false;
});

// Return to main board
backToBoard.addEventListener("click", function() {
  applicationsScreen.hidden = true;
  trackerScreen.hidden = false;
});



// INDIVIDUAL CASE FILE NAVIGATION

const caseFileScreen = document.getElementById("case-file-screen");

const backToApplications = document.getElementById(
  "back-to-applications"
);

backToApplications.addEventListener("click", function() {
  caseFileScreen.hidden = true;
  applicationsScreen.hidden = false;
});



// NEW CASE FORM NAVIGATION

const newCaseButton = document.getElementById("new-application");
const newCaseScreen = document.getElementById("new-case-screen");
const backFromNewCase = document.getElementById("back-from-new-case");


newCaseButton.addEventListener("click", function() {
  editingCaseIndex = null;
  caseForm.reset();

  document.querySelector("#new-case-screen h1").textContent =
    "New Case File ✳";

  document.getElementById("save-case-button").textContent =
    "+ Add to Files";

  applicationsScreen.hidden = true;
  newCaseScreen.hidden = false;
});



backFromNewCase.addEventListener("click", function() {
  newCaseScreen.hidden = true;
  editingCaseIndex = null;
  caseForm.reset();

  document.querySelector("#new-case-screen h1").textContent =
    "New Case File ✳";

  document.getElementById("save-case-button").textContent =
    "+ Add to Files";

  applicationsScreen.hidden = false;
});



// SAVED APPLICATIONS

const caseForm = document.getElementById("new-case-form");
const applicationsGrid = document.getElementById("applications-grid");

// Load existing applications when Electron starts

let applications = JSON.parse(
  localStorage.getItem("saved-applications") || "[]"
);

let selectedCaseIndex = null;
let editingCaseIndex = null;


// Create one notebook-paper card
function createApplicationCard(application, index) {
  const card = document.createElement("button");
  card.classList.add("application-paper");
  card.type = "button";

  const clip = document.createElement("span");
  clip.classList.add("paperclip");
  clip.textContent = "📎";

  const company = document.createElement("h2");
  company.textContent = application.company;

  const position = document.createElement("p");
  position.textContent = application.position;

  const status = document.createElement("span");
  status.classList.add("case-status");
  status.textContent = application.status.toUpperCase();

  card.append(clip, company, position, status);

  card.addEventListener("click", function() {
    selectedCaseIndex = index;
    document.getElementById("case-company").textContent =
      application.company;

    document.getElementById("case-position").textContent =
      application.position;

    document.getElementById("case-open-date").textContent =
      application.openDate || "Not set";

    document.getElementById("case-deadline").textContent =
      application.deadline || "Not set";

    document.getElementById("case-status").textContent =
      application.status;

    document.getElementById("case-summary").textContent =
      application.summary || "No summary yet.";

    document.getElementById("case-notes").textContent =
      application.notes || "No notes yet.";

    document.querySelector(".case-top span").textContent =
      "📎 CASE NO. " + String(index + 1).padStart(3, "0");

    applicationsScreen.hidden = true;
    caseFileScreen.hidden = false;
  });

  applicationsGrid.appendChild(card);
}

// Display all saved applications
function renderApplications() {
  applicationsGrid.innerHTML = "";

  applications.forEach(function(application, index) {
    createApplicationCard(application, index);
  });
  renderCalendar();
}

// When someone submits the New Case form
caseForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const application = {
    company: document.getElementById("company-input").value.trim(),
    position: document.getElementById("position-input").value.trim(),
    openDate: document.getElementById("open-date-input").value,
    deadline: document.getElementById("deadline-input").value,
    status: document.getElementById("status-input").value,
    summary: document.getElementById("summary-input").value.trim(),
    notes: document.getElementById("notes-input").value.trim()
  };

  
// Create a new case or update an existing case
if (editingCaseIndex === null) {
  applications.push(application);
} else {
  applications[editingCaseIndex] = application;
  editingCaseIndex = null;
}

  // Save all applications
  localStorage.setItem(
    "saved-applications",
    JSON.stringify(applications)
  );

  // Update the notebook-paper cards
  renderApplications();

  // Clear the form for next time
  caseForm.reset();
  document.querySelector("#new-case-screen h1").textContent =
  "New Case File ✳";

document.getElementById("save-case-button").textContent =
  "+ Add to Files";

  // Return to Applications directory
  newCaseScreen.hidden = true;
  applicationsScreen.hidden = false;
});

// Show saved applications when the app starts
renderApplications();


// EDIT AND DELETE CASES

const editCaseButton = document.getElementById("edit-case-button");
const deleteCaseButton = document.getElementById("delete-case-button");

// Edit an existing application
editCaseButton.addEventListener("click", function() {
  if (selectedCaseIndex === null) return;

  editingCaseIndex = selectedCaseIndex;
  const application = applications[editingCaseIndex];

  document.getElementById("company-input").value = application.company;
  document.getElementById("position-input").value = application.position;
  document.getElementById("open-date-input").value = application.openDate;
  document.getElementById("deadline-input").value = application.deadline;
  document.getElementById("status-input").value = application.status;
  document.getElementById("summary-input").value = application.summary;
  document.getElementById("notes-input").value = application.notes;

  document.querySelector("#new-case-screen h1").textContent =
    "Edit Case File ✳";

  document.getElementById("save-case-button").textContent =
    "✓ Save Changes";

  caseFileScreen.hidden = true;
  newCaseScreen.hidden = false;
});

// Delete an existing application
deleteCaseButton.addEventListener("click", function() {
  if (selectedCaseIndex === null) return;

  const application = applications[selectedCaseIndex];

  const confirmed = confirm(
    "Delete the case file for " + application.company + "?"
  );

  if (!confirmed) return;

  applications.splice(selectedCaseIndex, 1);

  localStorage.setItem(
    "saved-applications",
    JSON.stringify(applications)
  );

  renderApplications();

  selectedCaseIndex = null;

  caseFileScreen.hidden = true;
  applicationsScreen.hidden = false;
});

renderCalendar();