# Hong Kong Profits Tax Deadline Calculator

A source-linked calculator for likely Profits Tax Return (PTR) year, accounting-date code and represented-return filing dates. Verified annual rulesets currently cover PTR 2018/19 (AY2019) through PTR 2025/26 (AY2026).

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm ci
npm run dev
```

## Verify/build

```bash
npm test
npm run typecheck
npm run build
```

## PTR year identification

For a normal basis period, the year of assessment runs from 1 April to 31 March. The calculator labels the likely PTR year from the accounting period-end date that falls within that AY. For example, valid dates 28 February 2025 and 30 June 2024 both point to PTR 2024/25. User examples 31 February 2025 and 31 June 2024 are impossible calendar dates: the interface can explain the likely PTR year from the year/month, but asks the user to correct the date before calculating a deadline. A non-standard or longer basis period, accounting-date change, commencement, or specific IRD direction may change which return applies; the actual PTR is authoritative.

## Rules and maintenance

The annual IRD block-extension circular, later amendments and date-specific conditions are linked with each selected ruleset; the calculator does not extrapolate future dates.
- The annual GitHub Actions reminder is set for 15 April 2027–2031; it opens an issue with a primary-source review checklist.
- Dependabot checks npm packages and GitHub Actions weekly; CI runs tests, type-check and production build on pushes and pull requests.
- Historical dates are not treated as a universal arithmetic formula. Each supported year includes its IRD block-extension circular and located subsequent amendment circulars where applicable.
- Older electronic/Internet extensions may be application-based and depend on return issue date, the later of normal/extended dates, and eligibility. The tool does not infer an electronic date if the source facts do not support one safely.
- Future PTR years can be identified, but deadline rules remain unavailable until that year's IRD notices are published and verified. Dates are not copied forward.
- Update `lastVerified`, source URLs and checked dates on each review. Test every date boundary, filing route and loss-case exception.
- Five-year maintenance is a target, not a promise that rules stay unchanged. The IRD notice and current-year instructions always prevail.

## Scope and limitations

- Verified represented PTR rulesets: 2018/19 through 2025/26 (AY2019–AY2026).
- M-code current-year loss dates are conditional on the applicable IRD extension process and the return showing an allowable loss; they are not universal dates for loss-making companies.
- N-code no-extension status and normal filing due dates are distinct. Return issue dates, inactive/periodic file handling, unrepresented cases, mandatory e-filing and voluntary e-filing may differ.
- This app does not contact IRD, submit a return or determine a taxpayer's legal deadline.

## Primary references

- [IRD Tax Representatives' Corner](https://www.ird.gov.hk/eng/tax/taxrep.htm)
- [IRD electronic filing information](https://www.ird.gov.hk/eng/tax/bus_epf.htm)
- [IRD Profits Tax guidance](https://www.ird.gov.hk/eng/tax/bus_pft.htm)
- Annual circulars and subsequent amendment references appear alongside each result.

## Deploy on GitHub Pages

The repository includes a Pages workflow at `.github/workflows/deploy-pages.yml`. GitHub Pages is enabled with **Settings → Pages → GitHub Actions**. Pushes to `main` run tests, type-check, build and deploy the static app at `https://briangshk.github.io/hk-profits-tax-deadline-calculator/`.
