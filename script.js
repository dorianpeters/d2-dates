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
  // Use local date string to avoid timezone issues
  const iso = date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
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

// Get the calculation mode toggle (the hidden checkbox)
const calculationModeToggle = document.getElementById("calculationModeToggle");
let useCourtDays = calculationModeToggle.checked; // Initial state

// Add event listener to toggle calculation mode
calculationModeToggle.addEventListener("change", () => {
  useCourtDays = calculationModeToggle.checked;
  updateDeadlines(lastTrialDate); // Recalculate with the new mode
});


// Calculate deadlines and update container
function updateDeadlines(trialDate) {
  // Read custom deadlines input
  const customInput = document.getElementById("customDeadlines").value.trim();
  let differentials;
  if (customInput !== "") {
    differentials = customInput.split(',').map(value => parseInt(value.trim())).filter(num => !isNaN(num));
  } else {
    // Default differentials: negative for before, positive for after
    // Include 0 for the start date itself, adjusted if needed
    differentials = [-45, -30, -7, 0, 15, 30]; // More useful default differentials
  }

  // Generate HTML for each deadline
  let html = "";
  differentials.forEach(diff => {
    const startDate = new Date(trialDate); // Start calculation from the trial date
    let deadlineDate;
    let description;

    if (useCourtDays) {
      // Calculate using court days
      if (diff === 0) {
        deadlineDate = adjustForwardToCourtDay(new Date(startDate)); // Adjust start date to a court day if needed
        description = `Selected date (adjusted to court day):`;
      } else if (diff > 0) {
        // Count forward court days
        deadlineDate = new Date(startDate);
        let courtDaysCount = 0;
        while (courtDaysCount < diff) {
          deadlineDate.setDate(deadlineDate.getDate() + 1); // Move to the next day
          if (isCourtDay(deadlineDate)) {
            courtDaysCount++;
          }
        }
        // The loop finishes when courtDaysCount === diff. deadlineDate is the correct date.
        description = `${diff} court days after the selected date:`;
      } else { // diff < 0
        // Count backward court days
        deadlineDate = new Date(startDate);
        let courtDaysCount = 0;
        while (courtDaysCount < Math.abs(diff)) {
          deadlineDate.setDate(deadlineDate.getDate() - 1); // Move to the previous day
           if (isCourtDay(deadlineDate)) {
            courtDaysCount++;
          }
        }
        // The loop finishes when courtDaysCount === Math.abs(diff). deadlineDate is the correct date.
        description = `${Math.abs(diff)} court days before the selected date:`;
      }
    } else {
      // Calculate using calendar days (existing logic)
      deadlineDate = new Date(startDate);
      deadlineDate.setDate(deadlineDate.getDate() + diff);

      if (diff === 0) {
         description = `Selected date:`;
      } else if (diff > 0) {
        description = `${diff} calendar days after the selected date:`;
      } else { // diff < 0
        description = `${Math.abs(diff)} calendar days before the selected date:`;
      }

      // Adjust the final date if it falls on a weekend or holiday for calendar days
      if (!isCourtDay(deadlineDate)) {
          if (diff >= 0) { // If counting forward or 0, adjust forward
              deadlineDate = adjustForwardToCourtDay(deadlineDate);
          } else { // If counting backward, adjust backward
              deadlineDate = adjustBackwardToCourtDay(deadlineDate);
          }
      }
    }

    // Format date as "[weekday], [month] [day], [year]"
    const formattedDate = deadlineDate.toLocaleDateString("en-US", {
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
