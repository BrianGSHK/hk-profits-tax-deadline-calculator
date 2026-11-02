import type { ReturnRuleSet } from './types';

/**
 * Rules transcribed from the Hong Kong Inland Revenue Department's 2025/26
 * block-extension circulars. Each year must be confirmed from the new IRD
 * circular before being added here; no future year is guessed or extrapolated.
 */
export const AY2026: ReturnRuleSet = {
  assessmentYear: 2026,
  label: 'Year of assessment 2025/26 (AY2026)',
  validFrom: '2025-04-01',
  validTo: '2026-03-31',
  lastVerified: '2026-11-02',
  sources: [
    {
      label: 'GovHK: Profits Tax Return filing dates and extensions',
      url: 'https://www.gov.hk/en/residents/taxes/taxfiling/filing/types/profitstax.htm',
      checkedOn: '2026-11-02',
    },
    {
      label: 'IRD circular: Block Extension Scheme for 2025/26 Tax Returns',
      url: 'https://www.ird.gov.hk/eng/pdf/bel26e.pdf',
      checkedOn: '2026-11-02',
    },
    {
      label: 'IRD: Extended due date for D Code returns',
      url: 'https://www.ird.gov.hk/eng/pdf/bel26ea.pdf',
      checkedOn: '2026-11-02',
    },
    {
      label: 'IRD: Extended due date for M Code returns',
      url: 'https://www.ird.gov.hk/eng/pdf/bel26eb.pdf',
      checkedOn: '2026-11-02',
    },
    {
      label: 'IRD: Electronic filing of Profits Tax Returns',
      url: 'https://www.ird.gov.hk/eng/tax/bus_epf.htm',
      checkedOn: '2026-11-02',
    },
  ],
  rules: [
    {
      id: 'n',
      code: 'N',
      label: 'N Code',
      from: '2025-04-01',
      to: '2025-11-30',
      extendedPaperDue: null,
      representedPaperDue: '2026-05-04',
      electronicDue: '2026-06-04',
      notes:
        'There is no N-code block extension; the usual represented paper date is 4 May 2026. Qualifying voluntary electronic filing can extend the date to 4 June 2026, subject to application and filing conditions. Unrepresented cases have different ordinary dates.',
      authority: 'IRD 2025/26 block-extension circular, N-code schedule and e-filing provisions.',
    },
    {
      id: 'd',
      code: 'D',
      label: 'D Code',
      from: '2025-12-01',
      to: '2025-12-31',
      extendedPaperDue: '2026-08-31',
      representedPaperDue: '2026-08-31',
      electronicDue: '2026-10-02',
      notes:
        'The IRD extended the represented D-code paper deadline to 31 August 2026 and the electronic deadline to 2 October 2026. Case-specific routes can differ.',
      authority: 'IRD circular bel26ea.pdf, dated 14 July 2026.',
    },
    {
      id: 'm-profit',
      code: 'M',
      label: 'M Code — non-loss case',
      from: '2026-01-01',
      to: '2026-03-31',
      extendedPaperDue: '2026-11-30',
      representedPaperDue: '2026-11-30',
      electronicDue: '2026-12-30',
      notes:
        'The standard block-extension dates assume an eligible represented case. The ordinary M-code dates do not apply to a qualifying current-year allowable-loss case with an approved further extension.',
      authority: 'IRD circular bel26eb.pdf, dated 20 October 2026.',
    },
    {
      id: 'm-loss',
      code: 'M',
      label: 'M Code — allowable current-year loss case',
      from: '2026-01-01',
      to: '2026-03-31',
      extendedPaperDue: '2027-02-01',
      representedPaperDue: '2027-02-01',
      electronicDue: '2027-02-01',
      notes:
        'The 1 February 2027 date is a further extension for eligible M-code clients with an allowable current-year loss, subject to the required request/notification and the return actually showing an allowable loss. It is not automatic for every loss-making company.',
      authority: 'IRD circular bel26e.pdf, further M-code current-year loss-case extension provisions.',
    },
  ],
  caveat:
    'This is a reference aid, not an IRD assessment of your filing obligation. The displayed dates reflect the IRD 2025/26 block-extension rules checked on 2 November 2026. Your return issue date, representation status, accounting date changes, loss-case eligibility, mandatory e-filing status and IRD-specific instructions may change the applicable deadline. Confirm with the IRD or your tax representative.',
};
