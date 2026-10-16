/** In-page loader for lazy pages: stays invisible unless loading takes longer than ~200 ms. */
export default function RouteFallback() {
  return (
    <div className="delayed-spinner flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary-container border-t-primary" />
    </div>
  );
}
