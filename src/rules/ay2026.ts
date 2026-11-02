import type { ReturnRuleSet } from './types';

/** IRD 2025/26 rules. Later years are not extrapolated. */
export const AY2026: ReturnRuleSet = {
  assessmentYear: 2026,
  electronicDueLabel: 'Electronic filing due date (conditions apply)',
  label: 'PTR 2025/26 (AY2026)',
  validFrom: '2025-04-01',
  validTo: '2026-03-31',
  lastVerified: '2026-11-02',
  sources: [
    { label: 'GovHK: Profits Tax Return filing dates and extensions', url: 'https://www.gov.hk/en/residents/taxes/taxfiling/filing/types/profitstax.htm', checkedOn: '2026-11-02' },
    { label: 'IRD: Block Extension Scheme 2025/26 (bel26e.pdf)', url: 'https://www.ird.gov.hk/eng/pdf/bel26e.pdf', checkedOn: '2026-11-02' },
    { label: 'IRD: D-code extension (bel26ea.pdf)', url: 'https://www.ird.gov.hk/eng/pdf/bel26ea.pdf', checkedOn: '2026-11-02' },
    { label: 'IRD: M-code extension including paper and electronic dates (bel26eb.pdf)', url: 'https://www.ird.gov.hk/eng/pdf/bel26eb.pdf', checkedOn: '2026-11-02' },
    { label: 'IRD: Electronic filing of Profits Tax Returns', url: 'https://www.ird.gov.hk/eng/tax/bus_epf.htm', checkedOn: '2026-11-02' },
  ],
  rules: [
    { id: 'n', code: 'N', label: 'N Code', from: '2025-04-01', to: '2025-11-30', extendedPaperDue: null, representedPaperDue: '2026-05-04', electronicDue: '2026-06-04', notes: 'There is no N-code block extension; the represented paper date is 4 May 2026. The IRD electronic guidance lists 4 June 2026 for electronic filing; use the return notice and confirm any applicable conditions. Unrepresented cases have different ordinary dates.', authority: 'IRD 2025/26 block-extension circular, N-code schedule and e-filing provisions.' },
    { id: 'd', code: 'D', label: 'D Code', from: '2025-12-01', to: '2025-12-31', extendedPaperDue: '2026-08-31', representedPaperDue: '2026-08-31', electronicDue: '2026-10-02', notes: 'The IRD extended the represented D-code paper deadline to 31 August 2026 and the electronic deadline to 2 October 2026. Case-specific routes can differ.', authority: 'IRD circular bel26ea.pdf, dated 14 July 2026.' },
    { id: 'm-profit', code: 'M', label: 'M Code — non-loss case', from: '2026-01-01', to: '2026-03-31', extendedPaperDue: '2026-11-30', representedPaperDue: '2026-11-30', electronicDue: '2026-12-30', notes: 'The standard block-extension dates assume an eligible represented case. The ordinary M-code dates do not apply to a qualifying current-year allowable-loss case with an approved further extension.', authority: 'IRD circular bel26eb.pdf, dated 20 October 2026.' },
    { id: 'm-loss', code: 'M', label: 'M Code — allowable current-year loss case', from: '2026-01-01', to: '2026-03-31', extendedPaperDue: '2027-02-01', representedPaperDue: '2027-02-01', electronicDue: '2027-02-01', notes: 'The 1 February 2027 date is a further extension for eligible M-code clients with an allowable current-year loss, subject to the required request/notification and the return actually showing an allowable loss. It is not automatic for every loss-making company.', authority: 'IRD circular bel26e.pdf, further M-code current-year loss-case extension provisions.' },
  ],
  caveat: 'Reference dates for the represented Profits Tax Return programme for PTR 2025/26. Your return issue date, representation status, inactive/periodic-file status, accounting date changes, loss-case eligibility, mandatory e-filing status and IRD-specific instructions may change the applicable deadline. M-code loss dates depend on the IRD process and the return actually showing an allowable current-year loss. Confirm the actual deadline on your IRD notice or with your tax representative.',
};
