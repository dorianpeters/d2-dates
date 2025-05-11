// Initialize flatpickr
const fp = flatpickr("#dateInput", {
  dateFormat: "l-F-d-Y", // Output format
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

// Set of holidays (example format: YYYY-MM-DD)
const holidaySet = new Set([
  // 2025 Holidays
  "2025-01-01", // New Year's Day
  "2025-01-20", // Martin Luther King Jr. Day
  "2025-02-12", // Lincoln's Birthday
  "2025-02-17", // Presidents' Day
  "2025-03-31", // Cesar Chavez Day
  "2025-05-26", // Memorial Day
  "2025-06-19", // Juneteenth Day
  "2025-07-04", // Independence Day
  "2025-09-01", // Labor Day
  "2025-09-26", // Native American Day
  "2025-11-11", // Veterans Day
  "2025-11-27", // Thanksgiving Day
  "2025-11-28", // Day after Thanksgiving
  "2025-12-25", // Christmas Day

  // 2026 Holidays
  "2026-01-01", // New Year's Day
  "2026-01-19", // Martin Luther King Jr. Day
  "2026-02-12", // Lincoln's Birthday
  "2026-02-16", // Presidents' Day
  "2026-03-31", // Cesar Chavez Day
  "2026-05-25", // Memorial Day
  "2026-06-19", // Juneteenth Day
  "2026-07-03", // Independence Day (Observed)
  "2026-09-07", // Labor Day
  "2026-09-25", // Native American Day
  "2026-11-11", // Veterans Day
  "2026-11-26", // Thanksgiving Day
  "2026-11-27", // Day after Thanksgiving
  "2026-12-25", // Christmas Day

  // 2027 Holidays
  "2027-01-01", // New Year's Day
  "2027-01-18", // Martin Luther King Jr. Day
  "2027-02-12", // Lincoln's Birthday
  "2027-02-15", // Presidents' Day
  "2027-03-31", // Cesar Chavez Day
  "2027-05-31", // Memorial Day
  "2027-06-18", // Juneteenth Day (Observed)
  "2027-07-05", // Independence Day (Observed)
  "2027-09-06", // Labor Day
  "2027-09-24", // Native American Day
  "2027-11-11", // Veterans Day
  "2027-11-25", // Thanksgiving Day
  "2027-11-26", // Day after Thanksgiving
  "2027-12-24", // Christmas Day (Observed)
  "2027-12-31", // New Year's Day (Observed)

  // 2028 Holidays
  "2028-01-17", // Martin Luther King Jr. Day
  "2028-02-12", // Lincoln's Birthday
  "2028-02-21", // Presidents' Day
  "2028-03-31", // Cesar Chavez Day
  "2028-05-29", // Memorial Day
  "2028-06-19", // Juneteenth Day
  "2028-07-04", // Independence Day
  "2028-09-04", // Labor Day
  "2028-09-22", // Native American Day
  "2028-11-10", // Veterans Day (Observed)
  "2028-11-23", // Thanksgiving Day
  "2028-11-24", // Day after Thanksgiving
  "2028-12-25"  // Christmas Day
]);

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