import { describe, expect, it } from 'vitest';
import { ACTIVE_RULE_SETS, ruleForDate } from '../src/rules/engine';

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
});
