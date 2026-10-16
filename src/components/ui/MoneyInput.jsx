import { useId, useState } from 'react';
import { formatNumber, parseMoneyInput } from '../../utils/format';
import { MAX_AMOUNT } from '../../utils/validators';
import { SupportingText } from './Field';

/** Amount field that groups digits as you type (1.500.000 / 1,500,000). */
export default function MoneyInput({ value, onChange, label, error, hint, suffix = '₫', autoFocus, id, className = '' }) {
  const autoId = useId();
  const inputId = id || autoId;
  // Re-sync the visible text when the value is changed from outside (quick-fill, edit mode).
  const [prev, setPrev] = useState(value);
  const [display, setDisplay] = useState(value ? formatNumber(value) : '');
  if (prev !== value) {
    setPrev(value);
    if (parseMoneyInput(display) !== Number(value || 0)) {
      setDisplay(value === '' || value === undefined || value === null ? '' : formatNumber(value));
    }
  }

  function handleChange(e) {
    let raw = parseMoneyInput(e.target.value);
    if (raw > MAX_AMOUNT) raw = MAX_AMOUNT;
    setDisplay(raw ? formatNumber(raw) : '');
    setPrev(raw);
    onChange(raw);
  }

  return (
    <div className={className}>
      <div className={`md-field ${error ? 'md-field-error' : ''}`}>
        <div className="relative min-w-0 flex-1">
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            autoFocus={autoFocus}
            autoComplete="off"
            placeholder=" "
            value={display}
            onChange={handleChange}
            aria-invalid={!!error}
            className="md-input text-title-lg font-medium tabular-nums"
          />
          {label && (
            <label htmlFor={inputId} className="md-label">
              {label} *
            </label>
          )}
        </div>
        <span className="text-title-md text-on-surface-variant">{suffix}</span>
      </div>
      <SupportingText error={error} hint={hint} />
    </div>
  );
}
