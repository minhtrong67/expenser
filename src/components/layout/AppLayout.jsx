import { Suspense, useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import Topbar from "./Topbar";
import CommandPalette from "./CommandPalette";
import TransactionFormModal from "../TransactionFormModal";
import ScrollToTop from "../ui/ScrollToTop";
import RouteFallback from "../ui/RouteFallback";
import { NAV_ITEMS } from "./navConfig";

export default function AppLayout() {
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024,
  );

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Auto-close the drawer when navigating on small/medium screens
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [location.pathname]);

  const openAddTx = useCallback(() => setTxModalOpen(true), []);

  const current = NAV_ITEMS.find((n) =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to),
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-neutral-950">
      <Sidebar
        onAddClick={openAddTx}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-200 ${sidebarOpen ? "lg:pl-64" : "lg:pl-0"}`}
      >
        <Topbar
          title={current?.label || "Expenser"}
          onSearchClick={() => setPaletteOpen(true)}
          onMenuClick={() => setSidebarOpen((o) => !o)}
        />
        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10">
          <Suspense fallback={<RouteFallback />}>
            <Outlet context={{ openAddTx }} />
          </Suspense>
        </main>
      </div>
      <MobileNav onAddClick={openAddTx} />
      <ScrollToTop />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onAddTransaction={openAddTx}
      />
      <TransactionFormModal
        open={txModalOpen}
        onClose={() => setTxModalOpen(false)}
      />
    </div>
  );
}
