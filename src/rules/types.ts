export interface SourceReference {
  label: string;
  url: string;
  checkedOn: string;
}

export interface ReturnRule {
  id: string;
  code: string;
  label: string;
  from: string;
  to: string;
  /** Main represented paper filing date under the applicable block extension. */
  extendedPaperDue: string | null;
  /** Included explicitly to avoid conflating it with special e-filing routes. */
  representedPaperDue: string | null;
  /** Route-specific extended electronic date, where the IRD circular establishes one. */
  electronicDue: string | null;
  notes: string;
  authority: string;
}

export interface ReturnRuleSet {
  assessmentYear: number;
  label: string;
  validFrom: string;
  validTo: string;
  lastVerified: string;
  sources: SourceReference[];
  rules: ReturnRule[];
  caveat: string;
}

export interface DeadlineResult {
  assessmentYear: number;
  code: string;
  ruleLabel: string;
  accountingDate: string;
  paperDue: string | null;
  electronicDue: string | null;
  notes: string;
  authority: string;
  sources: SourceReference[];
  caveat: string;
}

export type FilingRoute = 'paper' | 'electronic';
export type LossStatus = 'profit-or-no-loss' | 'allowable-current-year-loss';
