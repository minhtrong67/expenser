export default function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-accent-600 dark:border-zinc-700 dark:border-t-accent-500" />
    </div>
  );
}
