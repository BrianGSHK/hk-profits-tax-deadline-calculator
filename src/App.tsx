import React from 'react';
import { CalendarDays, ExternalLink, Info, ShieldCheck } from 'lucide-react';
import { accountingDateCodeForDate, calculateDeadline, formatDate, returnYearLabel, rulesetForDate, assessmentYearNumberForDate } from './rules/engine';
import type { LossStatus } from './rules/types';
import './styles.css';

const IRD_RETURN_GUIDE = 'https://www.ird.gov.hk/eng/tax/taxrep.htm';

export default function App() {
  const [accountingDate, setAccountingDate] = React.useState('');
  const [lossStatus, setLossStatus] = React.useState<LossStatus>('profit-or-no-loss');
  const validAssessmentYear = assessmentYearNumberForDate(accountingDate);
  const ruleset = validAssessmentYear === undefined ? undefined : rulesetForDate(accountingDate);
  const assessmentYear = validAssessmentYear;
  const result = accountingDate && ruleset ? calculateDeadline(accountingDate, lossStatus, ruleset) : null;
  const selectedIsMCode = result?.code === 'M';
  const validYearLabel = assessmentYear === undefined ? null : returnYearLabel(assessmentYear);
  const invalidCalendarDate = Boolean(accountingDate) && validAssessmentYear === undefined;
  const accountingCode = accountingDateCodeForDate(accountingDate);

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
          Select or enter an accounting period-end. The calculator identifies the likely PTR year and standard N/D/M code for any calendar year. It shows filing dates only where that year’s IRD rules have been verified.
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
          type="date"
          min="0001-01-01"
          max="9999-12-31"
          autoComplete="off"
          value={accountingDate}
          onChange={(event) => setAccountingDate(event.target.value.trim())}
          aria-describedby="date-range-help"
        />
        <p className="field-help" id="date-range-help">Use the calendar picker or type a date. The year and accounting-date code work for past and future calendar years; deadline dates are shown only for years with a verified IRD ruleset. Impossible dates such as 31 February or 31 June cannot be selected.</p>

        {accountingDate && assessmentYear === undefined && (
          <div className="result-card result-error" role="alert">
            <h3>Choose or enter a valid date</h3>
            <p>The date must be a real calendar date in YYYY-MM-DD format, from 0001-01-01 through 9999-12-31.</p>
          </div>
        )}


        {assessmentYear !== undefined && validYearLabel && !invalidCalendarDate && (
          <div className="result-card year-identification" aria-live="polite">
            <p className="eyebrow">LIKELY RETURN YEAR</p>
            <h3>{validYearLabel}</h3>
            <p className="period-explanation">Standard accounting-date code: <strong>{accountingCode} code</strong>. For a normal accounting period, the period-end falls within the year of assessment from 1 April {assessmentYear - 1} to 31 March {assessmentYear}. A non-standard or longer period, accounting-date change, new business, or IRD direction may change which return applies. Confirm the year on your actual return.</p>
          </div>
        )}

        {assessmentYear !== undefined && !invalidCalendarDate && !ruleset && (
          <div className="result-card result-error" role="status">
            <h3>PTR year identified; deadline rules not verified here</h3>
            <p>We identify this as likely {validYearLabel}, with the standard {accountingCode}-code accounting period. The return year and code can be identified for any calendar year, but no deadline is calculated until that year’s IRD rules and amendments are verified. Check the date printed on the return and the latest IRD Tax Representatives’ Corner notice.</p>
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
      <footer className="footer"><span>Independent reference aid · Hong Kong</span><span>Year/code lookup: all valid calendar dates · deadline rules: PTR 2018/19–2025/26 verified</span></footer>
    </main>
  );
}
