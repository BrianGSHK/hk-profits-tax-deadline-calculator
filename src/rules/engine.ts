import { AY2026 } from './ay2026';
import { HISTORICAL_RULE_SETS } from './historical';
import type { DeadlineResult, FilingRoute, LossStatus, ReturnRule, ReturnRuleSet } from './types';

/** Rules are included only for years whose IRD source material has been checked. */
export const ACTIVE_RULE_SETS: readonly ReturnRuleSet[] = [...HISTORICAL_RULE_SETS, AY2026]
  .sort((a, b) => a.assessmentYear - b.assessmentYear);

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/** Validate a calendar date without parsing it in the host timezone. */
export function isIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return year >= 1 && year <= 9999 && month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
}

/** Suggest the month's final valid date for an impossible day-of-month, without changing input. */
export function suggestValidDate(value: string): string | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day <= daysInMonth(year, month)) return undefined;
  return `${match[1]}-${match[2]}-${String(daysInMonth(year, month)).padStart(2, '0')}`;
}

/** A standard basis-period end date belongs to the AY whose 1 April–31 March span contains it. */
export function assessmentYearNumberForDate(accountingDate: string): number | undefined {
  if (!isIsoDate(accountingDate)) return undefined;
  return assessmentYearNumberFromEnteredDate(accountingDate);
}

/** Infer a likely reporting year even if only the day-of-month is impossible (e.g. 31 February).
 * This is for a helpful PTR-year hint only; deadline calculation still rejects invalid dates.
 */
export function assessmentYearNumberFromEnteredDate(accountingDate: string): number | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(accountingDate);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  return month >= 4 ? year + 1 : year;
}

export function returnYearLabel(assessmentYear: number): string {
  const yearSuffix = assessmentYear < 10000 ? String(assessmentYear % 100).padStart(2, '0') : String(assessmentYear);
  return `PTR ${assessmentYear - 1}/${yearSuffix} (AY${assessmentYear})`;
}

/** Get the standard N/D/M accounting-date code independently of whether its year's deadlines are known. */
export function accountingDateCodeForDate(accountingDate: string): 'N' | 'D' | 'M' | undefined {
  if (!isIsoDate(accountingDate)) return undefined;
  const month = Number(accountingDate.slice(5, 7));
  const day = Number(accountingDate.slice(8, 10));
  if (month >= 4 && month <= 11) return 'N';
  if (month === 12) return 'D';
  if (month === 1 || month === 2 || month === 3) return 'M';
  return undefined;
}

export interface IndicativeDeadline {
  assessmentYear: number;
  label: string;
  code: 'N' | 'D' | 'M';
  paperDue: string;
  electronicDue: string;
  qualification?: string;
}

/** Illustrative future dates shifted from AY2026's verified schedule; never an official deadline. */
export function indicativeFutureDeadlines(accountingDate: string): IndicativeDeadline[] | undefined {
  const ay = assessmentYearNumberForDate(accountingDate);
  // Avoid rendering projected ISO dates whose due date would spill past year 9999.
  if (ay === undefined || ay <= 2026 || ay > 9997) return undefined;
  const shift = ay - 2026;
  const shifted = (iso: string) => `${Number(iso.slice(0, 4)) + shift}${iso.slice(4)}`;
  const rows = [
    { label: 'N Code', code: 'N' as const, paper: '2026-05-04', electronic: '2026-06-04' },
    { label: 'D Code', code: 'D' as const, paper: '2026-08-31', electronic: '2026-10-02' },
    { label: 'M Code — non-loss case', code: 'M' as const, paper: '2026-11-30', electronic: '2026-12-30' },
    { label: 'M Code — allowable current-year loss', code: 'M' as const, paper: '2027-02-01', electronic: '2027-02-01', qualification: 'Conditional: eligible allowable current-year loss and required IRD request/notification.' },
  ];
  return rows.map((row) => ({ assessmentYear: ay, label: row.label, code: row.code, paperDue: shifted(row.paper), electronicDue: shifted(row.electronic), qualification: row.qualification }));
}

export function rulesetForDate(accountingDate: string): ReturnRuleSet | undefined {
  if (!isIsoDate(accountingDate)) return undefined;
  return ACTIVE_RULE_SETS.find(
    (set) => accountingDate >= set.validFrom && accountingDate <= set.validTo,
  );
}

export function ruleForDate(
  accountingDate: string,
  lossStatus: LossStatus,
  ruleSet: ReturnRuleSet,
): ReturnRule | undefined {
  if (!isIsoDate(accountingDate)) return undefined;
  if (accountingDate < ruleSet.validFrom || accountingDate > ruleSet.validTo) return undefined;
  return ruleSet.rules.find((rule) => {
    if (accountingDate < rule.from || accountingDate > rule.to) return false;
    if (rule.id === 'm-loss') return lossStatus === 'allowable-current-year-loss';
    if (rule.id === 'm-profit') return lossStatus !== 'allowable-current-year-loss';
    return true;
  });
}

export function calculateDeadline(
  accountingDate: string,
  lossStatus: LossStatus = 'profit-or-no-loss',
  ruleSet?: ReturnRuleSet,
): DeadlineResult | null {
  const selectedRuleSet = ruleSet ?? rulesetForDate(accountingDate);
  if (!selectedRuleSet) return null;
  const rule = ruleForDate(accountingDate, lossStatus, selectedRuleSet);
  if (!rule) return null;
  return {
    assessmentYear: selectedRuleSet.assessmentYear,
    code: rule.code,
    ruleLabel: rule.label,
    accountingDate,
    paperDue: rule.representedPaperDue ?? rule.extendedPaperDue,
    electronicDue: rule.electronicDue,
    notes: rule.notes,
    authority: rule.authority,
    sources: selectedRuleSet.sources,
    caveat: selectedRuleSet.caveat,
  };
}

export function deadlineForRoute(
  accountingDate: string,
  route: FilingRoute,
  lossStatus: LossStatus = 'profit-or-no-loss',
  ruleSet?: ReturnRuleSet,
): string | null {
  const result = calculateDeadline(accountingDate, lossStatus, ruleSet);
  if (!result) return null;
  return route === 'paper' ? result.paperDue : result.electronicDue;
}

/** Backwards-compatible name: returns the verified ruleset covering this date, if available. */
export function assessmentYearForDate(accountingDate: string): ReturnRuleSet | undefined {
  return rulesetForDate(accountingDate);
}

export function formatDate(date: string | null, locale = 'en-HK'): string {
  if (!date || !isIsoDate(date)) return 'Not specified';
  const [year, month, day] = date.split('-').map(Number);
  const calendarDate = new Date(0);
  calendarDate.setUTCFullYear(year, month - 1, day);
  calendarDate.setUTCHours(0, 0, 0, 0);
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(calendarDate);
}
