// Label + helper wrapper for non-text controls (emoji picker, colour picker, ...).
export default function Field({ label, error, hint, required, children }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <p className="text-label-lg text-on-surface-variant">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </p>
      )}
      {children}
      {error ? (
        <p className="text-body-sm text-error">{error}</p>
      ) : hint ? (
        <p className="text-body-sm text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}

/** Shared helper line under filled text fields. */
export function SupportingText({ error, hint }) {
  if (!error && !hint) return null;
  return <p className={`md-supporting ${error ? 'md-supporting-error' : ''}`}>{error || hint}</p>;
}
