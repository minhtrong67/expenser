import Icon from "./Icon";

const VARIANTS = {
  primary:
    "bg-accent-600 text-white hover:bg-accent-700 hover:shadow-md hover:shadow-accent-600/20 active:bg-accent-800 disabled:bg-accent-300",
  secondary:
    "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 active:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
  ghost:
    "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-300",
  "outline-danger":
    "border border-rose-200 text-rose-600 hover:bg-rose-50 active:bg-rose-100 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10",
  outline:
    "border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800",
  customwhite: "bg-white text-zinc-700",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  className = "",
  type = "button",
  ...rest
}) {
  const sizeCls =
    size === "sm"
      ? "px-4 py-2.5 text-xs"
      : size === "lg"
        ? "px-7 py-4 text-base"
        : "px-5 py-3 text-sm";
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100 ${VARIANTS[variant]} ${sizeCls} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : icon ? (
        <Icon name={icon} size={18} />
      ) : null}
      {children}
    </button>
  );
}
