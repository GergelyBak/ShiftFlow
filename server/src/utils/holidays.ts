// Bajorországi + országos német ünnepnapok
export const getGermanHolidays = (year: number): string[] => {
  const holidays: string[] = [];

  const fmt = (m: number, d: number) =>
    `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  // ── Fix ünnepnapok ──────────────────────────────
  holidays.push(fmt(1, 1)); // Neujahr
  holidays.push(fmt(1, 6)); // Heilige Drei Könige (Bayern)
  holidays.push(fmt(5, 1)); // Tag der Arbeit
  holidays.push(fmt(8, 15)); // Mariä Himmelfahrt (Bayern)
  holidays.push(fmt(10, 3)); // Tag der Deutschen Einheit
  holidays.push(fmt(11, 1)); // Allerheiligen (Bayern)
  holidays.push(fmt(12, 25)); // 1. Weihnachtstag
  holidays.push(fmt(12, 26)); // 2. Weihnachtstag

  // ── Mozgó ünnepnapok (Húsvét alapján) ───────────
  const easter = getEasterDate(year);
  const addDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };
  const fmtDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  holidays.push(fmtDate(addDays(easter, -2))); // Karfreitag
  holidays.push(fmtDate(easter)); // Ostersonntag
  holidays.push(fmtDate(addDays(easter, 1))); // Ostermontag
  holidays.push(fmtDate(addDays(easter, 39))); // Christi Himmelfahrt
  holidays.push(fmtDate(addDays(easter, 49))); // Pfingstsonntag
  holidays.push(fmtDate(addDays(easter, 50))); // Pfingstmontag
  holidays.push(fmtDate(addDays(easter, 60))); // Fronleichnam (Bayern)

  return holidays;
};

export const isGermanHoliday = (date: Date): boolean => {
  const year = date.getFullYear();
  const holidays = getGermanHolidays(year);
  const dateStr = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return holidays.includes(dateStr);
};

// Gaussian algorithm for Easter date
const getEasterDate = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};
