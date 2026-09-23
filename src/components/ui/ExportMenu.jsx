import { useEffect, useRef, useState } from "react";
import Button from "./Button";
import Icon from "./Icon";

const FORMATS = [
  { id: "excel", label: "Excel (.xlsx)", icon: "table_view" },
  { id: "pdf", label: "PDF", icon: "picture_as_pdf" },
  { id: "csv", label: "CSV", icon: "description" },
];

export default function ExportMenu({
  label = "Xuất báo cáo",
  onSelect,
  disabled,
  size = "sm",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <Button
        className="w-full"
        variant="danger"
        size={size}
        icon="download"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
      </Button>
      {open && (
        <div className="absolute right-0 z-10 mt-1.5 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1.5 shadow-lg animate-scale-in dark:border-zinc-700 dark:bg-zinc-900">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setOpen(false);
                onSelect(f.id);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <span className="text-zinc-400">
                <Icon name={f.icon} size={18} />
              </span>
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
