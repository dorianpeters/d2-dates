import flatpickr from "flatpickr";
import 'flatpickr/dist/flatpickr.min.css';  // Import CSS for the calendar UI
import { holidaySet } from './holidays.js';

// Initialize flatpickr
const fp = flatpickr("#dateInput", {
  dateFormat: "l, F d, Y", // Output format
  defaultDate: new Date(),

  // Callback on date select
  onChange: function(selectedDates, dateStr, instance) {
    const trialDate = selectedDates[0];
    if (trialDate) {
      // Calculate and display deadlines
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

// Calculate deadlines and update spans
function updateDeadlines(trialDate) {
  const deadlines = {
    "sp-fifty-days": 50,
    "sp-fortyfive-days": 45,
    "sp-thirty-days": 30,
    "sp-fifteen-days": 15,
    "sp-seven-days": 7
  };

  for (const [spanId, daysBefore] of Object.entries(deadlines)) {
    const deadlineDate = new Date(trialDate);
    deadlineDate.setDate(deadlineDate.getDate() - daysBefore);
    const adjustedDate = adjustBackwardToCourtDay(deadlineDate);

    // Format the adjusted date as "[day], [month] [date], [year]"
    const formattedDate = adjustedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "2-digit",
      year: "numeric"
    });

    // Update the span with the calculated deadline
    document.getElementById(spanId).textContent = formattedDate;
  }
}
