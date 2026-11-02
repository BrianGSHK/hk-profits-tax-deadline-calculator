# Hong Kong Profits Tax Deadline Calculator

A small, source-linked React calculator for Hong Kong Profits Tax Return accounting-date codes and filing dates. It currently contains the AY2026 (2025/26) IRD ruleset only.

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

## Five-year maintenance approach (2026–2031)

- Rules are data separated from the calculator logic, one dated ruleset per assessment year.
- The annual GitHub Actions reminder is set for 15 April 2027–2031; it opens an issue with a primary-source review checklist.
- Dependabot checks npm packages and GitHub Actions weekly; CI runs tests, type-check and production build on pushes and pull requests.
- Do not extrapolate dates from the prior year. Add a new annual ruleset only after checking the new IRD primary circular(s), including paper/electronic dates, representative status, mandatory e-filing, extensions and loss-case conditions.
- Update `lastVerified`, source URLs and checked dates on every ruleset refresh.
- Keep date-boundary, gap/overlap, route and loss-case tests for each annual ruleset.
- Maintain Node dependencies with routine security updates; run the test/typecheck/build checks before merging.
- Review outdated rules when deadlines pass; retain old annual rules as history only if clearly labelled historical.

The five-year period is a maintenance target, not a promise that tax rules stay unchanged. The IRD notice and current-year instructions always prevail.

## Current scope and limitations

- AY2026 covers accounting year-ends from 1 April 2025 through 31 March 2026.
- Deadlines reflect the 2025/26 IRD and GovHK material reviewed on 2 November 2026.
- N-code, D-code, M-code and the special M-code allowable-loss case have different conditions. The loss-case extension requires the IRD extension process and a return showing an allowable loss; it is not a universal deadline for any loss-making company.
- The primary-data rules engine is unit tested separately from the UI.
- This app does not contact IRD, submit a return or determine an individual taxpayer's legal deadline.

## Primary references

- [GovHK: Profits Tax Return filing dates and extensions](https://www.gov.hk/en/residents/taxes/taxfiling/filing/types/profitstax.htm)
- [IRD 2025/26 circular letter to tax representatives](https://www.ird.gov.hk/eng/pdf/bel26e.pdf)
- [IRD D-code extension letter](https://www.ird.gov.hk/eng/pdf/bel26ea.pdf)
- [IRD M-code extension letter](https://www.ird.gov.hk/eng/pdf/bel26eb.pdf)
- [IRD electronic filing information](https://www.ird.gov.hk/eng/tax/bus_epf.htm)
- [IRD electronic Block Extension Scheme](https://www.ird.gov.hk/eng/tax/electronic_bes.htm)

## Deploy on GitHub Pages

The repository includes a Pages workflow at `.github/workflows/deploy-pages.yml`. After creating the repository, enable **Settings → Pages → GitHub Actions** once. Pushes to `main` then run tests, type-check, build and deploy the static app. The published project path is configured for `https://briangshk.github.io/hk-profits-tax-deadline-calculator/`.

## License

Private project repository. Add a license before redistributing or reusing the code outside its intended project.
