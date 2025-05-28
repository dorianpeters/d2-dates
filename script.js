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

// Adjust to next valid court day
function adjustForwardToCourtDay(date) {
  while (!isCourtDay(date)) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}


// Calculate deadlines and update container
function updateDeadlines(trialDate) {
  // Read custom deadlines input
  const customInput = document.getElementById("customDeadlines").value.trim();
  let differentials;
  if (customInput !== "") {
    differentials = customInput.split(',').map(value => parseInt(value.trim())).filter(num => !isNaN(num));
  } else {
    // Default differentials: negative for before, positive for after
    differentials = [-50, -45, -30, -15, -7, 30]; // Updated default differentials
  }

  // Generate HTML for each deadline
  let html = "";
  differentials.forEach(diff => {
    const deadlineDate = new Date(trialDate);
    let adjustedDate;
    let description;

    if (diff < 0) {
      // Calculate days before trial (using negative diff)
      deadlineDate.setDate(deadlineDate.getDate() + diff); // Adding a negative number subtracts
      adjustedDate = adjustBackwardToCourtDay(deadlineDate);
      description = `${Math.abs(diff)} Days before the date set for trial:`; // Use absolute value for description
    } else if (diff > 0) {
      // Calculate days after trial (using positive diff)
      deadlineDate.setDate(deadlineDate.getDate() + diff);
      adjustedDate = adjustForwardToCourtDay(deadlineDate);
      description = `${diff} Days after the date set for trial:`; // Use positive value for description
    } else {
        // Handle diff === 0 if necessary, or skip
        return;
    }


    // Format date as "[weekday], [month] [day], [year]"
    const formattedDate = adjustedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });

    html += `<h3>${description} <span class="deadlines">${formattedDate}</span></h3>`;
  });

  document.getElementById("deadlinesContainer").innerHTML = html;
}

// Update deadlines when the custom button is clicked
document.getElementById("updateCustomDeadlines").addEventListener("click", () => {
  updateDeadlines(lastTrialDate);
});

// Initial calculation on page load with default date
updateDeadlines(lastTrialDate);
