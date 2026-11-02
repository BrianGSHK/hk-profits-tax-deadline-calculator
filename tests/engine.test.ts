import { describe, expect, it } from 'vitest';
import { AY2026 } from '../src/rules/ay2026';
import {
  ACTIVE_RULE_SETS,
  assessmentYearForDate,
  assessmentYearNumberForDate,
  assessmentYearNumberFromEnteredDate,
  calculateDeadline,
  deadlineForRoute,
  formatDate,
  isIsoDate,
  returnYearLabel,
  ruleForDate,
  rulesetForDate,
  suggestValidDate,
} from '../src/rules/engine';

describe('multi-year PTR and assessment-year lookup', () => {
  it('maps accounting period-end dates to the PTR year whose AY contains the end date', () => {
    expect(returnYearLabel(assessmentYearNumberForDate('2025-02-28')!)).toBe('PTR 2024/25 (AY2025)');
    expect(returnYearLabel(assessmentYearNumberForDate('2024-06-30')!)).toBe('PTR 2024/25 (AY2025)');
    expect(returnYearLabel(assessmentYearNumberForDate('2025-03-31')!)).toBe('PTR 2024/25 (AY2025)');
    expect(returnYearLabel(assessmentYearNumberForDate('2025-04-01')!)).toBe('PTR 2025/26 (AY2026)');
  });

  it('can infer the likely PTR label for impossible day-of-month examples but never calculates their deadline', () => {
    for (const date of ['2025-02-31', '2024-06-31']) {
      expect(assessmentYearNumberFromEnteredDate(date)).toBe(2025);
      expect(assessmentYearNumberForDate(date)).toBeUndefined();
      expect(calculateDeadline(date)).toBeNull();
    }
    expect(suggestValidDate('2025-02-31')).toBe('2025-02-28');
    expect(suggestValidDate('2024-06-31')).toBe('2024-06-30');
  });

  it('contains explicitly verified historical return years PTR 2018/19 through PTR 2025/26', () => {
    expect(ACTIVE_RULE_SETS.map((set) => set.assessmentYear)).toEqual([2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]);
    for (const year of ACTIVE_RULE_SETS) {
      expect(year.label).toContain(`PTR ${year.assessmentYear - 1}/${String(year.assessmentYear).slice(-2)}`);
      expect(year.sources.length).toBeGreaterThan(0);
      expect(year.lastVerified).toBe('2026-11-02');
    }
  });

  it('refuses to extrapolate unverified future deadline rules', () => {
    expect(assessmentYearNumberForDate('2026-04-01')).toBe(2027);
    expect(returnYearLabel(assessmentYearNumberForDate('2026-04-01')!)).toBe('PTR 2026/27 (AY2027)');
    expect(rulesetForDate('2026-04-01')).toBeUndefined();
    expect(calculateDeadline('2026-04-01')).toBeNull();
  });
});

describe('AY2026 IRD return-code boundaries', () => {
  it.each([
    ['2025-04-01', 'n'],
    ['2025-11-30', 'n'],
    ['2025-12-01', 'd'],
    ['2025-12-31', 'd'],
    ['2026-01-01', 'm-profit'],
    ['2026-03-31', 'm-profit'],
  ])('assigns %s to %s', (date, id) => {
    expect(ruleForDate(date, 'profit-or-no-loss', AY2026)?.id).toBe(id);
  });

  it('routes M-code allowable-loss cases to the special approved-extension date', () => {
    expect(calculateDeadline('2026-01-01', 'allowable-current-year-loss')?.paperDue).toBe('2027-02-01');
    expect(calculateDeadline('2026-03-31', 'allowable-current-year-loss')?.electronicDue).toBe('2027-02-01');
  });

  it('does not apply the loss-case date outside the M-code range', () => {
    expect(ruleForDate('2025-12-31', 'allowable-current-year-loss', AY2026)?.id).toBe('d');
  });

  it('returns distinct paper and electronic deadlines for M code', () => {
    expect(deadlineForRoute('2026-01-01', 'paper')).toBe('2026-11-30');
    expect(deadlineForRoute('2026-01-01', 'electronic')).toBe('2026-12-30');
  });

  it('preserves the distinct M-code loss request and filing qualification in notes', () => {
    const result = calculateDeadline('2026-02-28', 'allowable-current-year-loss');
    expect(result?.notes).toContain('required request/notification');
    expect(result?.notes).toContain('not automatic');
  });

  it('rejects malformed and impossible calendar dates', () => {
    for (const date of ['', '2025-2-01', '2025-02-29', '2026-13-01', '2026-00-10']) {
      expect(isIsoDate(date)).toBe(false);
    }
    expect(isIsoDate('2024-02-29')).toBe(true);
    expect(isIsoDate('2026-04-01')).toBe(true);
  });

  it('does not classify dates outside AY2026 ruleset as AY2026 dates', () => {
    expect(calculateDeadline('2025-03-31', 'profit-or-no-loss', AY2026)).toBeNull();
    expect(calculateDeadline('2026-04-01', 'profit-or-no-loss', AY2026)).toBeNull();
    expect(assessmentYearForDate('2026-04-01')).toBeUndefined();
  });

  it('formats dates using UTC calendar fields', () => {
    expect(formatDate('2026-11-30', 'en-GB')).toBe('30 November 2026');
  });

  it('carries primary source links and verification date with each result', () => {
    const result = calculateDeadline('2026-01-15');
    expect(result?.sources.some((s) => s.url === 'https://www.ird.gov.hk/eng/pdf/bel26eb.pdf')).toBe(true);
    expect(AY2026.lastVerified).toBe('2026-11-02');
  });
});
