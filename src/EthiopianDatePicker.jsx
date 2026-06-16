import { useState } from "react";
import {
  ethiopianMonthsAmharic,
  ethiopianMonths,
  ethiopianWeekdaysAmharic,
  ethiopianWeekdaysEnglish,
  ethiopianMonthLength,
  ethiopianToGregorian,
  gregorianToEthiopian,
  gregorianToJDN,
  toGeez,
} from "./EthiopianCalendar";

// A real 13-month Ethiopian calendar date picker.
// Internally selects an Ethiopian Y/M/D, then reports the equivalent
// Gregorian "YYYY-MM-DD" back to the parent via onSelect (so the rest of
// the booking pipeline keeps working in Gregorian).
export default function EthiopianDatePicker({ value, onSelect, language = "en" }) {
  const am = language === "am";

  // Today, in both calendars, for "no past dates" enforcement.
  const now = new Date();
  const todayJDN = gregorianToJDN(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const todayEth = gregorianToEthiopian(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  );

  // The currently-selected Ethiopian date (if any), derived from the value.
  const selectedEth = value ? gregorianToEthiopian(value) : null;

  const [viewYear, setViewYear] = useState(selectedEth?.year || todayEth.year);
  const [viewMonth, setViewMonth] = useState(selectedEth?.month || todayEth.month);

  const monthNames = am ? ethiopianMonthsAmharic : ethiopianMonths;
  const weekdays = am ? ethiopianWeekdaysAmharic : ethiopianWeekdaysEnglish;
  const num = (n) => (am ? toGeez(n) : String(n));

  const daysInMonth = ethiopianMonthLength(viewYear, viewMonth);

  // Weekday (0=Sun) of day 1 of the viewed month, for grid alignment.
  const firstG = ethiopianToGregorian(viewYear, viewMonth, 1);
  const firstWeekday = new Date(firstG.year, firstG.month - 1, firstG.day).getDay();
  const firstDayJDN = gregorianToJDN(firstG.year, firstG.month, firstG.day);

  const goPrev = () => {
    if (viewMonth === 1) {
      setViewMonth(13);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };
  const goNext = () => {
    if (viewMonth === 13) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Disable "previous" once the viewed month is the current month or earlier
  // (the previous month would be entirely in the past).
  const prevDisabled = firstDayJDN <= todayJDN;

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handlePick = (d) => {
    const g = ethiopianToGregorian(viewYear, viewMonth, d);
    onSelect(g.formatted);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-3 sm:p-4 select-none">
      {/* Header: month/year nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={prevDisabled}
          className="px-3 py-2 rounded-lg bg-slate-800 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 transition"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="text-center">
          <div className="text-slate-900 font-bold text-base sm:text-lg">
            {monthNames[viewMonth - 1]} {num(viewYear)}
          </div>
          <div className="text-slate-500 text-xs">{am ? "ዓ.ም." : "E.C."}</div>
        </div>
        <button
          type="button"
          onClick={goNext}
          className="px-3 py-2 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((w) => (
          <div key={w} className="text-center text-[10px] sm:text-xs font-semibold text-slate-500 py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={`b${i}`} />;
          const g = ethiopianToGregorian(viewYear, viewMonth, d);
          const jdn = gregorianToJDN(g.year, g.month, g.day);
          const isPast = jdn < todayJDN;
          const isSelected =
            selectedEth &&
            selectedEth.year === viewYear &&
            selectedEth.month === viewMonth &&
            selectedEth.day === d;
          const isToday = jdn === todayJDN;
          return (
            <button
              key={d}
              type="button"
              disabled={isPast}
              onClick={() => handlePick(d)}
              className={[
                "aspect-square rounded-lg text-sm sm:text-base font-semibold transition flex items-center justify-center",
                isPast
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-800 hover:bg-yellow-100",
                isSelected ? "bg-yellow-500 text-slate-900 hover:bg-yellow-500" : "",
                !isSelected && isToday ? "ring-2 ring-yellow-400" : "",
              ].join(" ")}
              aria-label={`Select ${monthNames[viewMonth - 1]} ${d}, ${viewYear}`}
            >
              {num(d)}
            </button>
          );
        })}
      </div>

      {/* Live preview of the chosen date */}
      {selectedEth && (
        <div className="mt-3 text-center text-sm font-semibold text-slate-700">
          {am
            ? `${ethiopianMonthsAmharic[selectedEth.month - 1]} ${toGeez(selectedEth.day)} ቀን ${toGeez(selectedEth.year)} ዓ.ም.`
            : `${ethiopianMonths[selectedEth.month - 1]} ${selectedEth.day}, ${selectedEth.year} E.C.`}
        </div>
      )}
    </div>
  );
}
