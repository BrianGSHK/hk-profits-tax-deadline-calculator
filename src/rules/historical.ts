import type { ReturnRule, ReturnRuleSet, SourceReference } from './types';

const CHECKED = '2026-11-02';
type CodeDates = { paper: string; electronic?: string; note?: string; sourceNote?: string };
type HistoricalData = {
  assessmentYear: number;
  paper: { n: CodeDates; d: CodeDates; m: CodeDates };
  lossDate: string;
  sources: { label: string; url: string }[];
  electronicPolicy: string;
  lossNote: string;
  electronicLabel?: string;
};
const IRD = 'https://www.ird.gov.hk/eng/pdf/';
const src = (label: string, url: string): SourceReference => ({ label, url, checkedOn: CHECKED });
const date = (year: number, month: number, day: number): string => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

function makeRules(data: HistoricalData): ReturnRuleSet {
  const ay = data.assessmentYear;
  const start = ay - 1;
  const authority = `IRD Block Extension Scheme for ${start}/${String(ay).slice(-2)} Profits Tax Returns and cited amendments.`;
  const rules: ReturnRule[] = [
    { id: 'n', code: 'N', label: 'N Code', from: date(start, 4, 1), to: date(start, 11, 30), extendedPaperDue: null, representedPaperDue: data.paper.n.paper, electronicDue: data.paper.n.electronic ?? null, notes: `N-code return. Paper date is for the represented return programme; inactive, periodic, unrepresented and specially instructed cases can differ. ${data.paper.n.note ?? ''}`.trim(), authority: `${authority} N-code schedule. ${data.paper.n.sourceNote ?? ''}`.trim() },
    { id: 'd', code: 'D', label: 'D Code', from: date(start, 12, 1), to: date(start, 12, 31), extendedPaperDue: data.paper.d.paper, representedPaperDue: data.paper.d.paper, electronicDue: data.paper.d.electronic ?? null, notes: `D-code represented-return date. Confirm the return notice and any later IRD extension. ${data.paper.d.note ?? ''}`.trim(), authority: `${authority} D-code schedule. ${data.paper.d.sourceNote ?? ''}`.trim() },
    { id: 'm-profit', code: 'M', label: 'M Code — non-loss case', from: date(ay, 1, 1), to: date(ay, 3, 31), extendedPaperDue: data.paper.m.paper, representedPaperDue: data.paper.m.paper, electronicDue: data.paper.m.electronic ?? null, notes: `Standard M-code represented-return date. This is not the special extension for qualifying current-year loss cases. ${data.paper.m.note ?? ''} ${data.electronicPolicy}`.trim(), authority: `${authority} M-code schedule. ${data.paper.m.sourceNote ?? ''}`.trim() },
    { id: 'm-loss', code: 'M', label: 'M Code — allowable current-year loss case', from: date(ay, 1, 1), to: date(ay, 3, 31), extendedPaperDue: data.lossDate, representedPaperDue: data.lossDate, electronicDue: data.lossDate, notes: data.lossNote, authority: `${authority} M-code current-year allowable-loss extension provisions and amendments.` },
  ];
  return {
    assessmentYear: ay,
    electronicDueLabel: data.electronicLabel ?? 'Electronic / Internet filing date',
    label: `PTR ${start}/${String(ay).slice(-2)} (AY${ay})`,
    validFrom: date(start, 4, 1), validTo: date(ay, 3, 31), lastVerified: CHECKED,
    sources: data.sources.map(({ label, url }) => src(label, url)), rules,
    caveat: `Historical reference dates for represented Profits Tax Returns issued under the ${start}/${String(ay).slice(-2)} programme. The return issue date, date printed on the return, representation status, inactive/periodic-file status, accounting-period changes, mandatory e-filing status and later IRD notice can change the deadline. M-code loss dates depend on the applicable IRD request/notification and the return actually showing an allowable current-year loss. Confirm the actual deadline on the IRD notice or with a tax representative.`,
  };
}

export const AY2019 = makeRules({
  assessmentYear: 2019,
  paper: { n: { paper: '2019-05-02' }, d: { paper: '2019-08-15' }, m: { paper: '2019-11-15' } },
  lossDate: '2020-01-31',
  electronicPolicy: 'A further two weeks for qualifying Internet filing was available on application, calculated from the later of normal or extended due date; this field does not guess a generic date.',
  electronicLabel: 'Internet extension (conditional; date varies/not calculated)',
  lossNote: 'A further extension to 31 January 2020 was available for M-code clients with an allowable 2018/19 current-year loss, subject to the required list/request and the return showing an allowable loss. The same final date applied to qualifying e-file loss cases. Not automatic for all loss-making companies.',
  sources: [{ label: 'IRD: 2018/19 Block Extension Scheme (bel19e.pdf)', url: `${IRD}bel19e.pdf` }],
});

export const AY2020 = makeRules({
  assessmentYear: 2020,
  paper: {
    n: { paper: '2020-06-30' },
    d: { paper: '2020-09-30', sourceNote: 'IRD later extended the initial 17 August date to 15 September (bel20ea.pdf), then 30 September 2020 (bel20eb.pdf).' },
    m: { paper: '2020-11-30', sourceNote: 'IRD extended the initial 16 November date to 30 November 2020 (bel20eb.pdf).' },
  },
  lossDate: '2021-02-01',
  electronicPolicy: 'A further two weeks for qualifying Internet filing was available on application, running from the later of normal or extended due date. The specific date can depend on the return notice, so it is not inferred here.',
  electronicLabel: 'Internet extension (conditional; date varies/not calculated)',
  lossNote: 'A further M-code extension to 1 February 2021 was available for eligible clients with an allowable 2019/20 current-year loss, subject to the required list/request and the return showing an allowable loss. The same deadline applied for qualifying loss cases requesting e-filing. Not automatic for all loss-making companies.',
  sources: [
    { label: 'IRD: 2019/20 Block Extension Scheme (bel20e.pdf)', url: `${IRD}bel20e.pdf` },
    { label: 'IRD: D-code extension to 15 September 2020 (bel20ea.pdf)', url: `${IRD}bel20ea.pdf` },
    { label: 'IRD: final D- and M-code extensions (bel20eb.pdf)', url: `${IRD}bel20eb.pdf` },
  ],
});

export const AY2021 = makeRules({
  assessmentYear: 2021,
  paper: { n: { paper: '2021-05-31' }, d: { paper: '2021-08-16' }, m: { paper: '2021-11-15' } },
  lossDate: '2022-04-30',
  electronicPolicy: 'A further two weeks for qualifying Internet filing was available on application; because timing depends on return issue/normal due date, a generic electronic date is not shown.',
  electronicLabel: 'Internet extension (conditional; date varies/not calculated)',
  lossNote: 'The M-code allowable-current-year-loss date was extended from 31 January 2022 to 28 February, 31 March, then 30 April 2022. This depended on the IRD request/list and an allowable loss shown on the return. The original circular specified 31 January for qualifying electronic loss cases; later loss-case amendments govern. Not automatic for all loss-making companies.',
  sources: [
    { label: 'IRD: 2020/21 Block Extension Scheme and initial loss date (bel21e.pdf)', url: `${IRD}bel21e.pdf` },
    { label: 'IRD: M-code loss-case extension to 28 February 2022 (bel21ea.pdf)', url: `${IRD}bel21ea.pdf` },
    { label: 'IRD: M-code loss-case extension to 31 March 2022 (bel21eb.pdf)', url: `${IRD}bel21eb.pdf` },
    { label: 'IRD: M-code loss-case extension to 30 April 2022 (bel21ec.pdf)', url: `${IRD}bel21ec.pdf` },
  ],
});

export const AY2022 = makeRules({
  assessmentYear: 2022,
  paper: {
    n: { paper: '2022-06-30' },
    d: { paper: '2022-09-30', sourceNote: 'IRD extended the initial 31 August date to 15 September (bel22ea.pdf), then granted a final extension to 30 September 2022 (bel22eb.pdf).' },
    m: { paper: '2022-11-30', sourceNote: 'IRD extended the initial 15 November date to 30 November 2022 (bel22ec.pdf).' },
  },
  lossDate: '2023-01-31',
  electronicPolicy: 'A further two weeks for qualifying Internet filing was available on application; exact date can depend on the return notice/normal due date and is not inferred here.',
  electronicLabel: 'Internet extension (conditional; date varies/not calculated)',
  lossNote: 'A further extension to 31 January 2023 was available to eligible M-code clients with an allowable 2021/22 current-year loss, subject to the required list/request and the return showing an allowable loss. The same date applied to qualifying loss cases requesting e-filing. Not automatic for all loss-making companies.',
  sources: [
    { label: 'IRD: 2021/22 Block Extension Scheme (bel22e.pdf)', url: `${IRD}bel22e.pdf` },
    { label: 'IRD: D-code extension to 15 September 2022 (bel22ea.pdf)', url: `${IRD}bel22ea.pdf` },
    { label: 'IRD: final D-code extension to 30 September 2022 (bel22eb.pdf)', url: `${IRD}bel22eb.pdf` },
    { label: 'IRD: M-code extension to 30 November 2022 (bel22ec.pdf)', url: `${IRD}bel22ec.pdf` },
  ],
});

export const AY2023 = makeRules({
  assessmentYear: 2023,
  paper: {
    n: { paper: '2023-05-17', sourceNote: 'IRD extended the N-code date from 3 May to 17 May 2023 (bel23ea.pdf).' },
    d: { paper: '2023-08-15' },
    m: { paper: '2023-11-29', sourceNote: 'IRD extended the M-code date from 15 November to 29 November 2023 (bel23ec.pdf).' },
  },
  lossDate: '2024-01-31',
  electronicPolicy: 'A further one-month extension for qualifying Internet filing was available on application, counted from the later of the ordinary or extended due date. The specific resulting date may depend on issue date and is not inferred here.',
  electronicLabel: 'Internet extension (conditional; date varies/not calculated)',
  lossNote: 'A further extension to 31 January 2024 was available for M-code clients with an allowable 2022/23 current-year loss, subject to the required request and the return showing an allowable loss. The same date applied to qualifying loss cases requesting e-filing. Not automatic for all loss-making companies.',
  sources: [
    { label: 'IRD: 2022/23 Block Extension Scheme (bel23e.pdf)', url: `${IRD}bel23e.pdf` },
    { label: 'IRD: N-code extension to 17 May 2023 (bel23ea.pdf)', url: `${IRD}bel23ea.pdf` },
    { label: 'IRD: M-code extension to 29 November 2023 (bel23ec.pdf)', url: `${IRD}bel23ec.pdf` },
  ],
});

export const AY2024 = makeRules({
  assessmentYear: 2024,
  paper: {
    n: { paper: '2024-05-02', note: 'Active files due 2 May 2024; inactive files issued on 3 April were due 3 May 2024.' },
    d: { paper: '2024-08-29', sourceNote: 'IRD extended D-code paper filing from 15 August to 29 August 2024 (bel24ea.pdf).' },
    m: { paper: '2024-11-29', sourceNote: 'IRD extended M-code paper filing from 15 November to 29 November 2024 (bel24eb.pdf).' },
  },
  lossDate: '2025-01-31',
  electronicPolicy: 'A further one-month Internet-filing extension was available on application; exact date depends on issue/normal due date, so no generic date is inferred.',
  electronicLabel: 'Internet extension (conditional; date varies/not calculated)',
  lossNote: 'A further extension to 31 January 2025 was available for M-code clients with an allowable 2023/24 current-year loss, subject to required request and the return showing an allowable loss. The same date applied to qualifying loss cases requesting e-filing. Not automatic for all loss-making companies.',
  sources: [
    { label: 'IRD: 2023/24 Block Extension Scheme (bel24e.pdf)', url: `${IRD}bel24e.pdf` },
    { label: 'IRD: D-code extension to 29 August 2024 (bel24ea.pdf)', url: `${IRD}bel24ea.pdf` },
    { label: 'IRD: M-code extension to 29 November 2024 (bel24eb.pdf)', url: `${IRD}bel24eb.pdf` },
  ],
});

export const AY2025 = makeRules({
  assessmentYear: 2025,
  paper: {
    n: { paper: '2025-05-02', note: 'Active N-code files due 2 May 2025; inactive files may have a different issue-specific date.' },
    d: { paper: '2025-08-29', sourceNote: 'IRD extended D-code deadline from 15 August to 29 August 2025 (bel25ea.pdf).' },
    m: { paper: '2025-12-15', electronic: '2026-01-02', sourceNote: 'IRD extended M-code paper filing first to 2 December (bel25eb.pdf), then 15 December; e-filing date remained 2 January 2026 (bel25ec.pdf).' },
  },
  lossDate: '2026-02-13',
  electronicPolicy: 'The 2024/25 circular allowed a further one-month e-filing extension on application. IRD specified 2 January 2026 for M-code e-filing and later extended eligible M-code loss-case deadlines to 13 February 2026.',
  lossNote: 'A further extension for qualifying M-code clients with an allowable 2024/25 current-year loss required the IRD process and an allowable loss shown on the return. IRD later set 13 February 2026 for both paper and electronic loss cases. Not automatic for all loss-making companies.',
  sources: [
    { label: 'IRD: 2024/25 Block Extension Scheme (bel25e.pdf)', url: `${IRD}bel25e.pdf` },
    { label: 'IRD: D-code extension to 29 August 2025 (bel25ea.pdf)', url: `${IRD}bel25ea.pdf` },
    { label: 'IRD: M-code extension to 2 December 2025 (bel25eb.pdf)', url: `${IRD}bel25eb.pdf` },
    { label: 'IRD: M-code paper and electronic dates (bel25ec.pdf)', url: `${IRD}bel25ec.pdf` },
    { label: 'IRD: M-code loss-case extension to 13 February 2026 (bel25ed.pdf)', url: `${IRD}bel25ed.pdf` },
  ],
});

export const HISTORICAL_RULE_SETS: readonly ReturnRuleSet[] = [AY2019, AY2020, AY2021, AY2022, AY2023, AY2024, AY2025];
