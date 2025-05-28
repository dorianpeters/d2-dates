import flatpickr from "flatpickr";
import 'flatpickr/dist/flatpickr.min.css';  // Import CSS for the calendar UI
import { holidaySet } from './holidays.js';

let lastTrialDate = new Date(); // Global variable to keep track of the latest trial date

// Initialize flatpickr
const fp = flatpickr("#dateInput", {
  dateFormat: "l, F d, Y", // Output format
  defaultDate: lastTrialDate,

  // Callback on date select
  onChange: function(selectedDates, dateStr, instance) {
    const trialDate = selectedDates[0];
    if (trialDate) {
      lastTrialDate = trialDate; // update global
      updateDeadlines(trialDate);
    }
  }
});

// Utility to check court day
function isCourtDay(date) {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  const iso = date.toISOString().split('T')[0];
  return day !== 0 && day !== 6 && !holidaySet.has(iso);
}

// Adjust to previous valid court day
function adjustBackwardToCourtDay(date) {
  while (!isCourtDay(date)) {
    date.setDate(date.getDate() - 1);
  }
  return date;
}

// Calculate deadlines and update container
function updateDeadlines(trialDate) {
  // Read custom deadlines input
  const customInput = document.getElementById("customDeadlines").value.trim();
  let deadlines;
  if (customInput !== "") {
    deadlines = customInput.split(',').map(value => parseInt(value.trim())).filter(num => !isNaN(num));
  } else {
    deadlines = [50, 45, 30, 15, 7];
  }

  // Generate HTML for each deadline
  let html = "";
  deadlines.forEach(diff => {
    const deadlineDate = new Date(trialDate);
    deadlineDate.setDate(deadlineDate.getDate() - diff);
    const adjustedDate = adjustBackwardToCourtDay(deadlineDate);

    // Format date as "[weekday], [month] [day], [year]"
    const formattedDate = adjustedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });

    html += `<h3>${diff} Days before the date set for trial: <span class="deadlines">${formattedDate}</span></h3>`;
  });

  document.getElementById("deadlinesContainer").innerHTML = html;
}

// Update deadlines when the custom button is clicked
document.getElementById("updateCustomDeadlines").addEventListener("click", () => {
  updateDeadlines(lastTrialDate);
});
