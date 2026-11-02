import React from 'react';
import { CalendarDays, ExternalLink, Info, ShieldCheck } from 'lucide-react';
import { AY2026 } from './rules/ay2026';
import { calculateDeadline, formatDate } from './rules/engine';
import type { LossStatus } from './rules/types';
import './styles.css';

export default function App() {
  const [accountingDate, setAccountingDate] = React.useState('');
  const [lossStatus, setLossStatus] = React.useState<LossStatus>('profit-or-no-loss');
  const result = accountingDate ? calculateDeadline(accountingDate, lossStatus) : null;
  const selectedIsMCode = accountingDate >= '2026-01-01' && accountingDate <= '2026-03-31';

  function handleDateChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.value;
    setAccountingDate(next);
    if (next < '2026-01-01' || next > '2026-03-31') {
      setLossStatus('profit-or-no-loss');
    }
  }

  return (
    <main className="page-shell">
      <header className="masthead">
        <a className="brand" href="#top" aria-label="Hong Kong tax deadline calculator home">
          <span className="brand-mark">HK</span>
          <span>Tax Desk <small>FOUNDER TOOLS</small></span>
        </a>
        <a className="header-source" href="https://www.ird.gov.hk/eng/tax/taxrep.htm" target="_blank" rel="noreferrer">
          IRD reference <ExternalLink size={14} aria-hidden="true" />
        </a>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">HONG KONG · PROFITS TAX · AY2026</p>
        <h1>When is your Profits Tax Return due?</h1>
        <p className="hero-copy">
          Enter your company’s accounting year-end to find its 2025/26 return-code window and the corresponding IRD filing dates.
          We distinguish standard represented filing dates from special routes and extensions.
        </p>
        <div className="verified-line"><ShieldCheck size={16} /> Rules checked against IRD circulars on {formatDate(AY2026.lastVerified)}.</div>
      </section>

      <section className="calculator-card" aria-labelledby="calculator-title">
        <div className="section-heading">
          <span className="icon-tile"><CalendarDays size={21} /></span>
          <div>
            <p className="eyebrow">DATE LOOKUP</p>
            <h2 id="calculator-title">Assessment Year 2026</h2>
          </div>
        </div>

        <label className="field-label" htmlFor="accounting-date">Company accounting year-end</label>
        <input
          id="accounting-date"
          className="date-input"
          type="date"
          min={AY2026.validFrom}
          max={AY2026.validTo}
          value={accountingDate}
          onChange={handleDateChange}
          aria-describedby="date-range-help"
        />
        <p className="field-help" id="date-range-help">Select a date between 1 April 2025 and 31 March 2026.</p>

        <fieldset className={`loss-choice ${!selectedIsMCode ? 'is-disabled' : ''}`} disabled={!selectedIsMCode}>
          <legend>Current-year result</legend>
          <label className="radio-row">
            <input
              type="radio"
              name="loss-status"
              checked={lossStatus === 'profit-or-no-loss'}
              onChange={() => setLossStatus('profit-or-no-loss')}
            />
            <span>Profit or no allowable current-year loss</span>
          </label>
          <label className="radio-row">
            <input
              type="radio"
              name="loss-status"
              checked={lossStatus === 'allowable-current-year-loss'}
              onChange={() => setLossStatus('allowable-current-year-loss')}
            />
            <span>Allowable current-year loss (M-code cases only)</span>
          </label>
          {!selectedIsMCode && <p className="field-help">Loss-case extension selection applies only to M-code accounting dates.</p>}
        </fieldset>

        {!accountingDate && <div className="empty-state">Choose an accounting date to see the relevant filing dates.</div>}

        {accountingDate && !result && (
          <div className="result-card result-error" role="alert">
            <h3>Date not covered</h3>
            <p>Please choose an accounting year-end within the AY2026 range shown above. This tool does not infer deadlines for other assessment years.</p>
          </div>
        )}

        {result && (
          <div className="result-card" aria-live="polite">
            <div className="result-header"><div><p className="eyebrow">YOUR RESULT</p><h3>{result.ruleLabel}</h3></div><span className="code-chip">{result.code} CODE</span></div>
        <div className="result-grid">
              <div className="result-metric"><span>Accounting year-end</span><strong>{formatDate(result.accountingDate)}</strong></div>
              <div className="result-metric"><span>Paper filing date</span><strong>{formatDate(result.paperDue)}</strong></div>
              <div className="result-metric"><span>Electronic filing date</span><strong>{formatDate(result.electronicDue)}</strong></div>
            </div>
            {result.ruleLabel.includes('allowable current-year loss') && <div className="notice"><Info size={17} /><p>This date depends on the IRD granting the required further extension and the return showing an allowable loss. Verify that your representative submitted the request or notification.</p></div>}
            <div className="notice"><Info size={17} /><p>{result.notes}</p></div>
            <p className="authority"><strong>Rule note:</strong> {result.authority}</p>
          </div>
        )}
      </section>

      <section className="reference-section" aria-labelledby="reference-title">
        <div className="section-heading reference-heading"><div><p className="eyebrow">QUICK REFERENCE</p><h2 id="reference-title">AY2026 return-code ranges</h2></div></div>
        <p className="section-intro">These are the year-end date bands and the main dates stored in this ruleset. The M-code loss-case date is conditional—not an automatic deadline for every loss-making company.</p>
        <div className="table-wrap">
          <table>
            <caption>Hong Kong Profits Tax AY2026 return codes and reference filing dates</caption>
            <thead><tr><th scope="col">Return code</th><th scope="col">Accounting year-end</th><th scope="col">Paper date</th><th scope="col">E-filing date</th></tr></thead>
            <tbody>
              {AY2026.rules.map((rule) => (
                <tr key={rule.id}>
                  <th scope="row" data-label="Return code">{rule.label}</th>
                  <td data-label="Accounting year-end">{formatDate(rule.from)} – {formatDate(rule.to)}{rule.id === 'm-loss' ? <><br /><small>with qualifying allowable loss and approved extension</small></> : null}</td>
                  <td data-label="Paper date">{formatDate(rule.representedPaperDue ?? rule.extendedPaperDue)}</td>
                  <td data-label="E-filing date">{formatDate(rule.electronicDue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">For N code, the no-extension notice and main filing date are distinct: the dates shown for e-filing reflect the applicable voluntary e-filing route. The IRD’s individual notice and route-specific requirements prevail.</p>
      </section>

      <section className="sources-section" aria-labelledby="sources-title">
        <div className="section-heading reference-heading"><div><p className="eyebrow">PRIMARY SOURCES</p><h2 id="sources-title">Read the IRD instructions</h2></div></div>
        <p className="section-intro">Each year’s dates should be rechecked against that year’s IRD circular before being added to this calculator.</p>
        <ul className="source-list">
          {AY2026.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}<ExternalLink size={14} /></a><small>Checked {formatDate(source.checkedOn)}</small></li>)}
        </ul>
      </section>

      <aside className="disclaimer"><Info size={17} /><p>{AY2026.caveat}</p></aside>
      <footer className="footer"><span>Independent reference aid · Hong Kong</span><span>Assessment Year 2026 ruleset · v1.0</span></footer>
    </main>
  );
}
