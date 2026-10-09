export const TOTAL_HOLIDAY_DAYS = 24;

// Each public holiday worked in the given year earns one extra day off.
// Counts distinct calendar days (Berlin time), so two entries on the same
// holiday still give only one day.
export const countHolidayCompDays = (attendance: any[], year: number) => {
  const days = new Set<string>();
  for (const a of attendance) {
    if (a.status !== 'approved' || !a.isHoliday) continue;
    if ((a.type || 'work') !== 'work') continue;
    const day = new Date(a.checkIn).toLocaleDateString('sv-SE', {
      timeZone: 'Europe/Berlin',
    });
    if (day.startsWith(String(year))) days.add(day);
  }
  return days.size;
};
