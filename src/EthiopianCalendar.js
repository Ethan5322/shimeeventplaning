// Ethiopian Calendar utilities — ACCURATE conversion (Julian Day Number based)
// plus Ge'ez numeral rendering. The Ethiopian calendar has 13 months:
// 12 months of 30 days + Pagume (5 days, or 6 in a leap year).
// Ethiopian leap year: (year % 4 === 3).

export const ethiopianMonths = [
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
  "Megabit", "Miazia", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume",
];

export const ethiopianMonthsAmharic = [
  "መስከረም", "ጥቅምት", "ኅዳር", "ታኅሣሥ", "ጥር", "የካቲት",
  "መጋቢት", "ሚያዝያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜን",
];

// Amharic weekday names (Sunday-first, matching JS Date.getDay()).
export const ethiopianWeekdaysAmharic = [
  "እሑድ", "ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ",
];
export const ethiopianWeekdaysEnglish = [
  "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
];

// Julian Day Number of the Amete Mihret (Year of Grace) epoch.
const JD_EPOCH_AMETE_MIHRET = 1723856;

// True modulo (always non-negative).
function mod(a, b) {
  return ((a % b) + b) % b;
}

// --- Julian Day Number <-> Gregorian -----------------------------------

export function gregorianToJDN(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

export function jdnToGregorian(jdn) {
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return { year, month, day };
}

// --- Julian Day Number <-> Ethiopian -----------------------------------

export function ethiopianToJDN(year, month, day) {
  return (
    (JD_EPOCH_AMETE_MIHRET + 365) +
    365 * (year - 1) +
    Math.floor(year / 4) +
    30 * month +
    day -
    31
  );
}

export function jdnToEthiopian(jdn) {
  const r = mod(jdn - JD_EPOCH_AMETE_MIHRET, 1461);
  const n = mod(r, 365) + 365 * Math.floor(r / 1460);
  const year =
    4 * Math.floor((jdn - JD_EPOCH_AMETE_MIHRET) / 1461) +
    Math.floor(r / 365) -
    Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = mod(n, 30) + 1;
  return { year, month, day };
}

// --- Ge'ez numerals ----------------------------------------------------

const GEEZ_ONES = ["", "፩", "፪", "፫", "፬", "፭", "፮", "፯", "፰", "፱"];
const GEEZ_TENS = ["", "፲", "፳", "፴", "፵", "፶", "፷", "፸", "፹", "፺"];

// Convert a positive integer (1..9999) to Ge'ez numerals.
// Ge'ez has no zero; ፩ before ፻ (hundred) is omitted (100 => ፻).
export function toGeez(input) {
  const num = parseInt(input, 10);
  if (!Number.isFinite(num) || num < 1) return String(input);

  const pair = (n) => GEEZ_TENS[Math.floor(n / 10)] + GEEZ_ONES[n % 10];

  const hundreds = Math.floor(num / 100);
  const rest = num % 100;
  let out = "";
  if (hundreds > 0) {
    out += (hundreds === 1 ? "" : pair(hundreds)) + "፻";
  }
  out += pair(rest);
  return out;
}

// --- Calendar helpers --------------------------------------------------

export function isEthiopianLeapYear(year) {
  return mod(year, 4) === 3;
}

// Number of days in an Ethiopian month (Pagume = 5, or 6 in a leap year).
export function ethiopianMonthLength(year, month) {
  if (month === 13) return isEthiopianLeapYear(year) ? 6 : 5;
  return 30;
}

// --- Public conversion API (string-friendly) ---------------------------

// Accepts "YYYY-MM-DD" (Gregorian) and returns an Ethiopian date object.
export function gregorianToEthiopian(gregorianDate) {
  if (!gregorianDate) return null;
  const [year, month, day] = String(gregorianDate).split("-").map(Number);
  const eth = jdnToEthiopian(gregorianToJDN(year, month, day));
  return {
    ...eth,
    monthName: ethiopianMonths[eth.month - 1],
    monthNameAmharic: ethiopianMonthsAmharic[eth.month - 1],
    formatted: `${eth.year}/${String(eth.month).padStart(2, "0")}/${String(eth.day).padStart(2, "0")}`,
    geez: `${toGeez(eth.day)} ${ethiopianMonthsAmharic[eth.month - 1]} ${toGeez(eth.year)}`,
  };
}

// Returns "YYYY-MM-DD" Gregorian for an Ethiopian Y/M/D.
export function ethiopianToGregorian(ethiopianYear, ethiopianMonth, ethiopianDay) {
  const g = jdnToGregorian(ethiopianToJDN(ethiopianYear, ethiopianMonth, ethiopianDay));
  return {
    ...g,
    formatted: `${g.year}-${String(g.month).padStart(2, "0")}-${String(g.day).padStart(2, "0")}`,
  };
}

export function getCurrentDateInBothCalendars() {
  const today = new Date();
  const gregorianFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return {
    gregorian: gregorianFormatted,
    ethiopian: gregorianToEthiopian(gregorianFormatted),
  };
}

// Format a Gregorian "YYYY-MM-DD" for display in either calendar/language.
// When calendar==="ethiopian" and language==="am", days/year use Ge'ez numerals.
export function formatDateForDisplay(date, calendar = "gregorian", language = "en") {
  if (!date) return "";
  if (calendar === "ethiopian") {
    const e = gregorianToEthiopian(date);
    if (!e) return "";
    if (language === "am") {
      return `${e.monthNameAmharic} ${toGeez(e.day)} ቀን ${toGeez(e.year)} ዓ.ም.`;
    }
    return `${e.monthName} ${e.day}, ${e.year} E.C.`;
  }
  const [year, month, day] = String(date).split("-");
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthNamesAmharic = [
    "ጃንዋሪ", "ፌብሩዋሪ", "ማርች", "ኤፕሪል", "ሜይ", "ጁን",
    "ጁላይ", "ኦገስት", "ሴፕቴምበር", "ኦክቶበር", "ኖቬምበር", "ዲሴምበር",
  ];
  const idx = parseInt(month, 10) - 1;
  if (language === "am") {
    return `${monthNamesAmharic[idx]} ${parseInt(day, 10)}, ${year}`;
  }
  return `${monthNames[idx]} ${parseInt(day, 10)}, ${year}`;
}
