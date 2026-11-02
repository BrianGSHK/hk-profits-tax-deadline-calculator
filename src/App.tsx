import React from 'react';
import { CalendarDays, ExternalLink, Info, ShieldCheck } from 'lucide-react';
import { calculateDeadline, formatDate, returnYearLabel, rulesetForDate, suggestValidDate, assessmentYearNumberForDate, assessmentYearNumberFromEnteredDate } from './rules/engine';
import type { LossStatus } from './rules/types';
import './styles.css';

const IRD_RETURN_GUIDE = 'https://www.ird.gov.hk/eng/tax/taxrep.htm';

export default function App() {
  const [accountingDate, setAccountingDate] = React.useState('');
  const [lossStatus, setLossStatus] = React.useState<LossStatus>('profit-or-no-loss');
  const validAssessmentYear = assessmentYearNumberForDate(accountingDate);
  const enteredAssessmentYear = assessmentYearNumberFromEnteredDate(accountingDate);
  const ruleset = validAssessmentYear === undefined ? undefined : rulesetForDate(accountingDate);
  const assessmentYear = validAssessmentYear ?? enteredAssessmentYear;
  const result = accountingDate && ruleset ? calculateDeadline(accountingDate, lossStatus, ruleset) : null;
  const selectedIsMCode = result?.code === 'M';
  const validYearLabel = assessmentYear === undefined ? null : returnYearLabel(assessmentYear);
  const suggestedDate = suggestValidDate(accountingDate);
  const invalidCalendarDate = enteredAssessmentYear !== undefined && validAssessmentYear === undefined;

  React.useEffect(() => {
    if (!selectedIsMCode) setLossStatus('profit-or-no-loss');
  }, [selectedIsMCode]);

  return (
    <main className="page-shell">
      <header className="masthead">
        <a className="brand" href="#top" aria-label="Hong Kong tax deadline calculator home">
          <span className="brand-mark">HK</span>
          <span>Tax Desk <small>FOUNDER TOOLS</small></span>
        </a>
        <a className="header-source" href={IRD_RETURN_GUIDE} target="_blank" rel="noreferrer">
          IRD reference <ExternalLink size={14} aria-hidden="true" />
        </a>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">HONG KONG · PROFITS TAX · MULTI-YEAR LOOKUP</p>
        <h1>Which Profits Tax Return year is this?</h1>
        <p className="hero-copy">
          Enter your accounting period-end. The calculator identifies the likely PTR year and, where a year-specific IRD ruleset has been verified, shows the relevant code and filing dates. It does not guess future deadlines.
        </p>
        <div className="verified-line"><ShieldCheck size={16} /> Verified represented-return deadline rules: PTR 2018/19 to PTR 2025/26.</div>
      </section>

      <section className="calculator-card" aria-labelledby="calculator-title">
        <div className="section-heading">
          <span className="icon-tile"><CalendarDays size={21} /></span>
          <div>
            <p className="eyebrow">ACCOUNTING PERIOD LOOKUP</p>
            <h2 id="calculator-title">Identify your PTR year</h2>
          </div>
        </div>

        <label className="field-label" htmlFor="accounting-date">Company accounting period-end date</label>
        <input
          id="accounting-date"
          className="date-input"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="YYYY-MM-DD (e.g. 2025-02-28)"
          value={accountingDate}
          onChange={(event) => setAccountingDate(event.target.value.trim())}
          aria-describedby="date-range-help"
        />
        <p className="field-help" id="date-range-help">Enter a real date as YYYY-MM-DD. For example, 28 February 2025 is likely PTR 2024/25. The examples 31 February 2025 and 31 June 2024 aren't real calendar dates; they point to the likely PTR 2024/25 only as a hint, and must be corrected before the calculator can show a filing deadline.</p>

        {accountingDate && assessmentYear === undefined && (
          <div className="result-card result-error" role="alert">
            <h3>Enter a date in YYYY-MM-DD format</h3>
            <p>Please include a valid month and day, such as 2025-02-28.</p>
          </div>
        )}

        {assessmentYear !== undefined && validYearLabel && invalidCalendarDate && (
          <div className="result-card result-error" role="alert">
            <p className="eyebrow">LIKELY RETURN YEAR — DATE NEEDS CORRECTION</p>
            <h3>{validYearLabel}</h3>
            {suggestedDate ? (
              <p>The date {accountingDate} does not exist. Based on its month and year, it would ordinarily fall in this PTR reporting year. For a deadline lookup, correct it to <button className="inline-button" type="button" onClick={() => setAccountingDate(suggestedDate)}>{formatDate(suggestedDate)} ({suggestedDate})</button>. The calculator will not calculate a deadline from an impossible date.</p>
            ) : <p>This date needs correction before we can calculate a filing deadline.</p>}
          </div>
        )}

        {assessmentYear !== undefined && validYearLabel && !invalidCalendarDate && (
          <div className="result-card year-identification" aria-live="polite">
            <p className="eyebrow">LIKELY RETURN YEAR</p>
            <h3>{validYearLabel}</h3>
            <p className="period-explanation">For a normal accounting period, the period-end date falls within the year of assessment from 1 April {assessmentYear - 1} to 31 March {assessmentYear}. A non-standard or longer accounting period, changed accounting date, new business, or IRD direction may change which return applies. Confirm the year printed on your actual return.</p>
          </div>
        )}

        {assessmentYear !== undefined && !invalidCalendarDate && !ruleset && (
          <div className="result-card result-error" role="status">
            <h3>PTR year identified; deadline rules not verified here</h3>
            <p>We identify this as likely {validYearLabel}, but this calculator has no verified deadline ruleset for that year. Future-year deadlines are not copied from an earlier year. Check the date printed on the return and the latest IRD Tax Representatives’ Corner notice.</p>
            <p><a href={IRD_RETURN_GUIDE} target="_blank" rel="noreferrer">Open the IRD Tax Representatives’ Corner <ExternalLink size={13} /></a></p>
          </div>
        )}

        {ruleset && !invalidCalendarDate && (
          <>
            <div className="ruleset-banner">
              <div><p className="eyebrow">VERIFIED RULES FOR THIS YEAR</p><strong>{ruleset.label}</strong></div>
              <span>Checked {formatDate(ruleset.lastVerified)}</span>
            </div>
            <fieldset className={`loss-choice ${!selectedIsMCode ? 'is-disabled' : ''}`} disabled={!selectedIsMCode}>
              <legend>Current-year result</legend>
              <label className="radio-row">
                <input type="radio" name="loss-status" checked={lossStatus === 'profit-or-no-loss'} onChange={() => setLossStatus('profit-or-no-loss')} />
                <span>Profit or no allowable current-year loss</span>
              </label>
              <label className="radio-row">
                <input type="radio" name="loss-status" checked={lossStatus === 'allowable-current-year-loss'} onChange={() => setLossStatus('allowable-current-year-loss')} />
                <span>Allowable current-year loss (M-code cases only)</span>
              </label>
              {!selectedIsMCode && <p className="field-help">The special loss-case extension option applies only to M-code accounting dates.</p>}
            </fieldset>

            {result && (
              <div className="result-card" aria-live="polite">
                <div className="result-header"><div><p className="eyebrow">YEAR-SPECIFIC RESULT</p><h3>{result.ruleLabel}</h3></div><span className="code-chip">{result.code} CODE</span></div>
                <div className="result-grid">
                  <div className="result-metric"><span>Period-end date</span><strong>{formatDate(result.accountingDate)}</strong></div>
                  <div className="result-metric"><span>Represented paper date</span><strong>{formatDate(result.paperDue)}</strong></div>
                  <div className="result-metric"><span>{ruleset.electronicDueLabel ?? 'Electronic filing date'}</span><strong>{formatDate(result.electronicDue)}</strong></div>
                </div>
                {result.ruleLabel.includes('allowable current-year loss') && <div className="notice"><Info size={17} /><p>This date depends on the IRD granting the required further extension and the return actually showing an allowable loss. Verify that your representative submitted the required request or notification.</p></div>}
                <div className="notice"><Info size={17} /><p>{result.notes}</p></div>
                <p className="authority"><strong>Rule note:</strong> {result.authority}</p>
              </div>
            )}

            <section className="reference-section inline-reference" aria-labelledby="reference-title">
              <div className="section-heading reference-heading"><div><p className="eyebrow">QUICK REFERENCE</p><h2 id="reference-title">{ruleset.label} return-code ranges</h2></div></div>
              <p className="section-intro">Dates apply to the represented return programme shown in the linked IRD circulars. Return notices, inactive/periodic cases, filing route and individual extensions can differ.</p>
              <div className="table-wrap"><table><caption>{ruleset.label} return codes and reference dates</caption><thead><tr><th scope="col">Return code</th><th scope="col">Accounting period-end</th><th scope="col">Paper date</th><th scope="col">{ruleset.electronicDueLabel ?? 'Electronic filing date'}</th></tr></thead>
                  <tbody>
                    {ruleset.rules.map((rule) => (
                      <tr key={rule.id}>
                        <th scope="row" data-label="Return code">{rule.label}</th>
                        <td data-label="Accounting period-end">{formatDate(rule.from)} – {formatDate(rule.to)}{rule.id === 'm-loss' ? <><br /><small>qualifying allowable loss and required extension</small></> : null}</td>
                        <td data-label="Paper date">{formatDate(rule.representedPaperDue ?? rule.extendedPaperDue)}</td>
                        <td data-label={ruleset.electronicDueLabel ?? 'Electronic filing date'}>{formatDate(rule.electronicDue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="table-note">“No extension” for N code is different from the normal return due date; e-filing extensions may need an application and compliance with route-specific conditions. The return itself and its year-specific IRD instructions prevail.</p>
            </section>

            <section className="sources-section" aria-labelledby="sources-title">
              <div className="section-heading reference-heading"><div><p className="eyebrow">PRIMARY SOURCES</p><h2 id="sources-title">Read the IRD instructions</h2></div></div>
              <p className="section-intro">The selected year's dates are based on the following source material. Any later IRD amendment takes precedence.</p>
              <ul className="source-list">
                {ruleset.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={14} /></a><small>Checked {formatDate(source.checkedOn)}</small></li>)}
              </ul>
            </section>
            <aside className="disclaimer"><Info size={17} /><p>{ruleset.caveat}</p></aside>
          </>
        )}
      </section>
      <footer className="footer"><span>Independent reference aid · Hong Kong</span><span>Rulesets PTR 2018/19–2025/26 · future rules not extrapolated</span></footer>
    </main>
  );
}
