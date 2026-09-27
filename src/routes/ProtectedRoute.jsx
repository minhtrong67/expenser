import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <>
        {" "}
        <style>{` @keyframes expenser-spin { to { transform: rotate(360deg); } } @keyframes expenser-indeterminate { 0% { transform: translateX(-130%); } 50% { transform: translateX(120%); } 100% { transform: translateX(320%); } } @keyframes expenser-shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(220%); } } @keyframes expenser-fade-up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } } @keyframes expenser-scale { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } } .expenser-spin { animation: expenser-spin 1.8s linear infinite; } .expenser-indeterminate { animation: expenser-indeterminate 1.5s ease-in-out infinite; } .expenser-shimmer { animation: expenser-shimmer 1.8s ease-in-out infinite; } .expenser-fade-up { animation: expenser-fade-up 0.45s ease-out both; } .expenser-scale { animation: expenser-scale 0.45s cubic-bezier(.2,.8,.2,1) both; } @media (prefers-reduced-motion: reduce) { .expenser-spin, .expenser-indeterminate, .expenser-shimmer, .expenser-fade-up, .expenser-scale { animation: none !important; } } `}</style>{" "}
        <div
          role="status"
          aria-live="polite"
          className=" relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 "
        >
          {" "}
          {/* Ambient background */}{" "}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {" "}
            <div className=" absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/[0.055] blur-[110px] dark:bg-accent-500/[0.075] " />{" "}
            <div className=" absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-400/[0.05] blur-3xl " />{" "}
          </div>{" "}
          {/* Subtle grid */}{" "}
          <div
            className=" pointer-events-none absolute inset-0 opacity-[0.018] dark:opacity-[0.035] "
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />{" "}
          {/* Main loading card */}{" "}
          <div className=" expenser-scale relative flex w-[calc(100%-32px)] max-w-[370px] flex-col items-center rounded-[30px] border border-zinc-200/70 bg-white/85 px-8 py-9 shadow-[0_20px_70px_-25px_rgba(0,0,0,0.15)] backdrop-blur-2xl dark:border-zinc-800/80 dark:bg-zinc-900/75 dark:shadow-[0_20px_70px_-25px_rgba(0,0,0,0.6)] ">
            {" "}
            {/* Logo area */}{" "}
            <div className="relative">
              {" "}
              {/* Glow */}{" "}
              <div className=" absolute inset-[-18px] rounded-[34px] bg-accent-500/10 blur-2xl dark:bg-accent-500/[0.08] " />{" "}
              {/* Rotating border */}{" "}
              <div className=" expenser-spin absolute inset-[-5px] rounded-[25px] border-2 border-transparent border-t-accent-500/80 border-r-accent-500/20 " />{" "}
              {/* Logo container */}{" "}
              <div className=" relative flex h-[78px] w-[78px] items-center justify-center rounded-[23px] border border-zinc-200/80 bg-white shadow-lg shadow-zinc-900/[0.07] dark:border-zinc-700/80 dark:bg-zinc-800 dark:shadow-black/30 ">
                {" "}
                <img
                  src="/icons/icon-192.png"
                  alt="Expenser"
                  draggable={false}
                  className="h-16 w-16 rounded-[18px] object-cover"
                />{" "}
              </div>{" "}
            </div>{" "}
            {/* Brand */}{" "}
            <div className=" expenser-fade-up mt-7 flex flex-col items-center ">
              {" "}
              <h1 className=" text-[16px] font-bold tracking-[-0.015em] text-zinc-900 dark:text-zinc-100 ">
                {" "}
                Expenser{" "}
              </h1>{" "}
              <p className=" mt-1.5 text-[13px] text-zinc-400 dark:text-zinc-500 ">
                {" "}
                Đang chuẩn bị không gian của bạn{" "}
              </p>{" "}
            </div>{" "}
            {/* Progress section */}{" "}
            <div
              className=" expenser-fade-up mt-7 w-full "
              style={{ animationDelay: "80ms" }}
            >
              {" "}
              <div className="mb-2.5 flex items-center justify-between">
                {" "}
                <span className=" text-[11px] font-medium text-zinc-400 dark:text-zinc-500 ">
                  {" "}
                  Đang tải dữ liệu{" "}
                </span>{" "}
                <span className=" flex items-center gap-1.5 text-[11px] font-semibold text-accent-600 dark:text-accent-400 ">
                  {" "}
                  <span className=" h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500 " />{" "}
                  Loading{" "}
                </span>{" "}
              </div>{" "}
              {/* Progress track */}{" "}
              <div className=" relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 ">
                {" "}
                {/* Main moving bar */}{" "}
                <div
                  className=" expenser-indeterminate absolute inset-y-0 left-0 w-[38%] rounded-full bg-accent-500 "
                  style={{ boxShadow: "0 0 14px rgba(99, 102, 241, 0.35)" }}
                />{" "}
                {/* Shine */}{" "}
                <div className=" expenser-shimmer absolute inset-y-0 left-0 w-[35%] bg-gradient-to-r from-transparent via-white/35 to-transparent dark:via-white/10 " />{" "}
              </div>{" "}
            </div>{" "}
            {/* Bottom status */}{" "}
            <div
              className=" expenser-fade-up mt-6 flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 "
              style={{ animationDelay: "160ms" }}
            >
              {" "}
              {/* Spinner */}{" "}
              <svg
                className="h-3.5 w-3.5 expenser-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                {" "}
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="opacity-20"
                />{" "}
                <path
                  d="M21 12a9 9 0 0 0-9-9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />{" "}
              </svg>{" "}
              <span>Vui lòng chờ trong giây lát</span>{" "}
            </div>{" "}
          </div>{" "}
          {/* Accessibility */}{" "}
          <span className="sr-only">
            {" "}
            Đang tải Expenser, vui lòng chờ trong giây lát{" "}
          </span>{" "}
        </div>{" "}
      </>
    );
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}
