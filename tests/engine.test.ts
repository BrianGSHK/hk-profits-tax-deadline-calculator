import { describe, expect, it } from 'vitest';
import { AY2026 } from '../src/rules/ay2026';
import {
  assessmentYearForDate,
  calculateDeadline,
  deadlineForRoute,
  formatDate,
  isIsoDate,
  ruleForDate,
} from '../src/rules/engine';

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
    expect(isIsoDate('2026-04-01')).toBe(true); // valid calendar day, outside this ruleset
  });

  it('does not classify dates outside the rule set', () => {
    expect(calculateDeadline('2025-03-31')).toBeNull();
    expect(calculateDeadline('2026-04-01')).toBeNull();
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
