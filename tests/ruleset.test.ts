import { describe, expect, it } from 'vitest';
import { AY2026 } from '../src/rules/ay2026';
import { ruleForDate } from '../src/rules/engine';

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

describe('annual ruleset integrity', () => {
  it('covers every valid AY2026 date exactly once for each loss-status route', () => {
    for (const loss of ['profit-or-no-loss', 'allowable-current-year-loss'] as const) {
      for (const date of isoDays(AY2026.validFrom, AY2026.validTo)) {
        expect(ruleForDate(date, loss, AY2026), `${date} / ${loss}`).toBeDefined();
      }
    }
  });

  it('contains no gaps or overlaps in effective rules for either loss status', () => {
    const days = isoDays(AY2026.validFrom, AY2026.validTo);
    for (const loss of ['profit-or-no-loss', 'allowable-current-year-loss'] as const) {
      for (const date of days) {
        expect(ruleForDate(date, loss, AY2026), `${date} / ${loss}`).toBeDefined();
        const effective = AY2026.rules.filter((r) => {
          if (date < r.from || date > r.to) return false;
          if (r.id === 'm-loss') return loss === 'allowable-current-year-loss';
          if (r.id === 'm-profit') return loss === 'profit-or-no-loss';
          return true;
        });
        expect(effective.length, `${date} / ${loss}`).toBe(1);
      }
    }
  });

  it('includes primary IRD references with direct HTTPS URLs', () => {
    expect(AY2026.sources.length).toBeGreaterThanOrEqual(3);
    for (const source of AY2026.sources) {
      expect(source.url).toMatch(/^https:\/\/www\.ird\.gov\.hk\//);
      expect(source.checkedOn).toMatch(/^2026-/);
    }
  });
});
