import { describe, expect, it } from 'vitest';
import { ACTIVE_RULE_SETS, indicativeFutureDeadlines, ruleForDate } from '../src/rules/engine';

function isoDays(start: string, end: string): string[] {
  const out: string[] = [];
  const d = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (d <= last) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

const statuses = ['profit-or-no-loss', 'allowable-current-year-loss'] as const;

describe('annual ruleset integrity', () => {
  for (const set of ACTIVE_RULE_SETS) {
    it(`covers each valid ${set.label} date exactly once per loss-status scenario`, () => {
      for (const loss of statuses) {
        for (const date of isoDays(set.validFrom, set.validTo)) {
          expect(ruleForDate(date, loss, set), `${date} / ${loss}`).toBeDefined();
          const effective = set.rules.filter((rule) => {
            if (date < rule.from || date > rule.to) return false;
            if (rule.id === 'm-loss') return loss === 'allowable-current-year-loss';
            if (rule.id === 'm-profit') return loss === 'profit-or-no-loss';
            return true;
          });
          expect(effective.length, `${set.label}: ${date} / ${loss}`).toBe(1);
        }
      }
    });

    it(`contains primary IRD references for ${set.label}`, () => {
      expect(set.sources.length).toBeGreaterThan(0);
      for (const source of set.sources) {
        expect(source.url).toMatch(/^https:\/\/(www\.)?(ird\.gov\.hk|gov\.hk)\//);
        expect(source.checkedOn).toMatch(/^2026-/);
      }
    });
  }

  it('projects future calendar-year schedules from the latest verified annual dates by AY offset', () => {
    const firstFuture = indicativeFutureDeadlines('2026-04-01');
    const secondFuture = indicativeFutureDeadlines('2027-04-01');
    expect(firstFuture?.[0].paperDue).toBe('2027-05-04');
    expect(secondFuture?.[0].paperDue).toBe('2028-05-04');
    expect(secondFuture?.[1].paperDue).toBe('2028-08-31');
    expect(secondFuture?.[2].paperDue).toBe('2028-11-30');
    expect(secondFuture?.[3].paperDue).toBe('2029-02-01');
    expect(secondFuture?.[3].qualification).toContain('required IRD request');
    expect(indicativeFutureDeadlines('9996-04-01')?.[0].paperDue).toBe('9997-05-04');
    expect(indicativeFutureDeadlines('9997-04-01')).toBeUndefined();
    expect(indicativeFutureDeadlines('9999-04-01')).toBeUndefined();
  });
});
