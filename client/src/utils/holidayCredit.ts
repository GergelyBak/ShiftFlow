export const TOTAL_HOLIDAY_DAYS = 24;
const DAYS_PER_MONTH = TOTAL_HOLIDAY_DAYS / 12;
// §3 BUrlG: 24 days on a 6-day week basis
const STATUTORY_DAYS_6DAY_WEEK = 24;

const berlinDay = (date: string | Date) =>
  new Date(date).toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });

const isApprovedWork = (a: any) =>
  a.status === 'approved' && a.checkOut && (a.type || 'work') === 'work';

// §5 (2) BUrlG: fractions of at least half a day are rounded up,
// smaller fractions are kept as they are
const roundLeave = (days: number) => {
  const frac = days - Math.floor(days);
  return frac >= 0.5 ? Math.ceil(days) : Math.round(days * 10) / 10;
};

export interface MinijobLeave {
  fromMonth: number; // 0-based
  toMonth: number; // 0-based, inclusive
  months: number;
  workDays: number;
  daysPerWeek: number;
  days: number;
}

export interface HolidayBreakdown {
  minijob: MinijobLeave | null;
  fullTime: number;
  fullTimeFromMonth: number | null;
  compDays: number;
  total: number;
}

export interface ContractInfo {
  contractStartDate?: string | null;
  previousEmployeeType?: string | null;
}

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

// Leave earned in a minijob before the contract start in the given year.
// The period runs from the first month with approved work to the month
// before the contract start. Days per week come from the recorded work days,
// and the statutory minimum is pro-rated: 24 × daysPerWeek / 6 × months / 12.
export const calcMinijobLeave = (
  attendance: any[],
  year: number,
  contract: ContractInfo,
): MinijobLeave | null => {
  if (contract.previousEmployeeType !== 'minijob' || !contract.contractStartDate)
    return null;
  const contractStart = new Date(contract.contractStartDate);
  if (contractStart.getFullYear() !== year) return null;

  const workDays = new Set<string>();
  for (const a of attendance) {
    if (!isApprovedWork(a)) continue;
    if (new Date(a.checkIn) >= contractStart) continue;
    const day = berlinDay(a.checkIn);
    if (day.startsWith(String(year))) workDays.add(day);
  }
  if (workDays.size === 0) return null;

  const firstDay = [...workDays].sort()[0];
  const fromMonth = Number(firstDay.slice(5, 7)) - 1;
  const toMonth = contractStart.getMonth() - 1;
  const months = toMonth - fromMonth + 1;
  if (months <= 0) return null;

  const periodStart = new Date(year, fromMonth, 1);
  const weeks =
    (contractStart.getTime() - periodStart.getTime()) / (7 * 24 * 3600 * 1000);
  const daysPerWeek = Math.min(6, workDays.size / weeks);
  const days = roundLeave(
    ((STATUTORY_DAYS_6DAY_WEEK * daysPerWeek) / 6) * (months / 12),
  );

  return {
    fromMonth,
    toMonth,
    months,
    workDays: workDays.size,
    daysPerWeek: Math.round(daysPerWeek * 10) / 10,
    days,
  };
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
    const day = berlinDay(a.checkIn);
    if (day.startsWith(String(year))) days.add(day);
  }
  return days.size;
};

export const calcHolidayBreakdown = (
  attendance: any[],
  year: number,
  contract: ContractInfo,
): HolidayBreakdown => {
  const start = contract.contractStartDate
    ? new Date(contract.contractStartDate)
    : null;
  const minijob = calcMinijobLeave(attendance, year, contract);
  const fullTime = calcHolidayEntitlement(contract.contractStartDate, year);
  const compDays = countHolidayCompDays(
    attendance,
    year,
    contract.contractStartDate,
  );
  return {
    minijob,
    fullTime,
    fullTimeFromMonth:
      start && start.getFullYear() === year ? start.getMonth() : null,
    compDays,
    total: (minijob?.days ?? 0) + fullTime + compDays,
  };
};
