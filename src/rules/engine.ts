import { AY2026 } from './ay2026';
import type { DeadlineResult, FilingRoute, LossStatus, ReturnRule, ReturnRuleSet } from './types';

export const ACTIVE_RULE_SETS: readonly ReturnRuleSet[] = [AY2026];

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
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
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
  ruleSet: ReturnRuleSet = AY2026,
): DeadlineResult | null {
  const rule = ruleForDate(accountingDate, lossStatus, ruleSet);
  if (!rule) return null;
  return {
    assessmentYear: ruleSet.assessmentYear,
    code: rule.code,
    ruleLabel: rule.label,
    accountingDate,
    paperDue: rule.representedPaperDue ?? rule.extendedPaperDue,
    electronicDue: rule.electronicDue,
    notes: rule.notes,
    authority: rule.authority,
    sources: ruleSet.sources,
    caveat: ruleSet.caveat,
  };
}

export function deadlineForRoute(
  accountingDate: string,
  route: FilingRoute,
  lossStatus: LossStatus = 'profit-or-no-loss',
  ruleSet: ReturnRuleSet = AY2026,
): string | null {
  const result = calculateDeadline(accountingDate, lossStatus, ruleSet);
  if (!result) return null;
  return route === 'paper' ? result.paperDue : result.electronicDue;
}

export function assessmentYearForDate(accountingDate: string): ReturnRuleSet | undefined {
  return ACTIVE_RULE_SETS.find(
    (set) => accountingDate >= set.validFrom && accountingDate <= set.validTo,
  );
}

export function formatDate(date: string | null, locale = 'en-HK'): string {
  if (!date || !isIsoDate(date)) return 'Not specified';
  const [year, month, day] = date.split('-').map(Number);
  // Construct using UTC to avoid off-by-one display in time zones west of UTC.
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
