// Ethiopian Calendar Conversion Utility
// Ethiopian calendar is 7-8 years behind Gregorian calendar

export const ethiopianMonths = [
  "Meskerem",  // September
  "Tikimt",    // October
  "Hidar",     // November
  "Tahsas",    // December
  "Tir",       // January
  "Yekatit",   // February
  "Megabit",   // March
  "Miazia",    // April
  "Ginbot",    // May
  "Sene",      // June
  "Hamle",     // July
  "Nehase",    // August
  "Pagume",    // Extra days (5 or 6)
];

export const ethiopianMonthsAmharic = [
  "መስከረም",
  "ጥቅምት",
  "ኅዳር",
  "ታኅሳስ",
  "ጥር",
  "የካቲት",
  "መጋቢት",
  "ሚያዝያ",
  "ግንቦት",
  "ሰነ",
  "ሐምሌ",
  "ነሐሴ",
  "ጳጉሜ",
];

// Convert Gregorian date to Ethiopian calendar
export function gregorianToEthiopian(gregorianDate) {
  if (!gregorianDate) return null;

  // Parse date string (YYYY-MM-DD format)
  const [year, month, day] = gregorianDate.split("-").map(Number);
  const gDate = new Date(year, month - 1, day);

  // Get day of year
  const startOfYear = new Date(year, 0, 0);
  const diff = gDate - startOfYear;
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Ethiopian year calculation
  let ethiopianYear = year - 8;
  if (month < 9 || (month === 9 && day < 11)) {
    ethiopianYear -= 1;
  }

  // Ethiopian month and day calculation
  let ethiopianMonth, ethiopianDay;

  if (month >= 9) {
    ethiopianMonth = month - 9 + 1;
    ethiopianDay = day;
    if (ethiopianMonth === 1 && day < 11) {
      ethiopianMonth = 13;
      ethiopianYear -= 1;
      ethiopianDay = day + 25;
    }
  } else {
    ethiopianMonth = month + 3;
    ethiopianDay = day;
  }

  // Handle page/pagume month
  if (ethiopianMonth === 13 && ethiopianDay > 5) {
    ethiopianMonth = 1;
    ethiopianDay -= 5;
  }

  return {
    year: ethiopianYear,
    month: ethiopianMonth,
    day: ethiopianDay,
    monthName: ethiopianMonths[ethiopianMonth - 1],
    monthNameAmharic: ethiopianMonthsAmharic[ethiopianMonth - 1],
    formatted: `${ethiopianYear}/${String(ethiopianMonth).padStart(2, "0")}/${String(ethiopianDay).padStart(2, "0")}`,
    formattedAmharic: `${ethiopianYear}/${String(ethiopianMonth).padStart(2, "0")}/${String(ethiopianDay).padStart(2, "0")}`,
  };
}

// Convert Ethiopian date back to Gregorian
export function ethiopianToGregorian(ethiopianYear, ethiopianMonth, ethiopianDay) {
  // This is a simplified conversion
  // For accurate conversion, a more complex algorithm is needed

  let gregorianYear = ethiopianYear + 8;
  let gregorianMonth = ethiopianMonth + 8;
  let gregorianDay = ethiopianDay;

  // Handle month overflow
  if (gregorianMonth > 12) {
    gregorianMonth -= 12;
    gregorianYear += 1;
  }

  // Handle pagume month
  if (ethiopianMonth === 13) {
    gregorianYear += 1;
    gregorianMonth = 1;
    gregorianDay = ethiopianDay - 5;
  }

  // Adjust for the September 11 offset
  if (gregorianMonth >= 9) {
    if (gregorianDay < 11) {
      gregorianMonth -= 1;
      if (gregorianMonth === 0) {
        gregorianMonth = 12;
        gregorianYear -= 1;
      }
      gregorianDay += 20;
    }
  }

  return {
    year: gregorianYear,
    month: gregorianMonth,
    day: gregorianDay,
    formatted: `${gregorianYear}-${String(gregorianMonth).padStart(2, "0")}-${String(gregorianDay).padStart(2, "0")}`,
  };
}

// Get current date in both calendars
export function getCurrentDateInBothCalendars() {
  const today = new Date();
  const gregorianFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const ethiopian = gregorianToEthiopian(gregorianFormatted);

  return {
    gregorian: gregorianFormatted,
    ethiopian: ethiopian.formatted,
  };
}

// Format date for display
export function formatDateForDisplay(date, calendar = "gregorian", language = "en") {
  if (calendar === "ethiopian") {
    const ethiopian = gregorianToEthiopian(date);
    if (language === "am") {
      return `${ethiopian.monthNameAmharic} ${ethiopian.day}, ${ethiopian.year} (ዓ.ም.)`;
    }
    return `${ethiopian.monthName} ${ethiopian.day}, ${ethiopian.year} (E.C.)`;
  } else {
    // Gregorian
    const [year, month, day] = date.split("-");
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthNamesAmharic = [
      "ጃንዋሪ", "ፌብርዋሪ", "ማርች", "ኤፕሪል", "ሜይ", "ጁን",
      "ጁላይ", "ኦገስት", "ሴፕቴምበር", "ኦክቶበር", "ኖቬምበር", "ዲሴምበር"
    ];

    const monthIndex = parseInt(month) - 1;
    if (language === "am") {
      return `${monthNamesAmharic[monthIndex]} ${parseInt(day)}, ${year}`;
    }
    return `${monthNames[monthIndex]} ${parseInt(day)}, ${year}`;
  }
}
