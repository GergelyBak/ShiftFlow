export const TOTAL_HOLIDAY_DAYS = 24;
const DAYS_PER_MONTH = TOTAL_HOLIDAY_DAYS / 12;

// Yearly entitlement: 2 days per month. If the contract started during the
// given year, only the months from the start month to December count
// (e.g. start in June → 7 × 2 = 14 days).
export const calcHolidayEntitlement = (
  contractStartDate: string | null | undefined,
  year: number,
) => {
  if (!contractStartDate) return TOTAL_HOLIDAY_DAYS;
  const start = new Date(contractStartDate);
  if (start.getFullYear() < year) return TOTAL_HOLIDAY_DAYS;
  if (start.getFullYear() > year) return 0;
  return (12 - start.getMonth()) * DAYS_PER_MONTH;
};

// Each public holiday worked in the given year (from the contract start on)
// earns one extra day off. Counts distinct calendar days (Berlin time), so two
// entries on the same holiday still give only one day.
export const countHolidayCompDays = (
  attendance: any[],
  year: number,
  contractStartDate?: string | null,
) => {
  const from = contractStartDate ? new Date(contractStartDate) : null;
  const days = new Set<string>();
  for (const a of attendance) {
    if (a.status !== 'approved' || !a.isHoliday) continue;
    if ((a.type || 'work') !== 'work') continue;
    if (from && new Date(a.checkIn) < from) continue;
    const day = new Date(a.checkIn).toLocaleDateString('sv-SE', {
      timeZone: 'Europe/Berlin',
    });
    if (day.startsWith(String(year))) days.add(day);
  }
  return days.size;
};
