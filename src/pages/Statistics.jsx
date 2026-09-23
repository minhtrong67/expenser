import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  LabelList,
} from "recharts";
import Icon from "../components/ui/Icon";
import ExportMenu from "../components/ui/ExportMenu";
import { ChartSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "./Dashboard";
import { useData } from "../contexts/DataContext";
import {
  formatMoney,
  formatDateShort,
  formatCompactMoney,
} from "../utils/format";
import { exportRangeReport } from "../utils/exportImport";

const RANGE_OPTIONS = [
  { id: "today", label: "Hôm nay" },
  { id: "week", label: "Tuần này" },
  { id: "month", label: "Tháng này" },
  { id: "year", label: "Năm nay" },
  { id: "all", label: "Tất cả" },
];

function getRange(id) {
  const now = new Date();
  const start = new Date(now);
  if (id === "today") {
    start.setHours(0, 0, 0, 0);
  } else if (id === "week") {
    const day = (now.getDay() + 6) % 7; // Monday-based
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
  } else if (id === "month") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else if (id === "year") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  } else {
    return { start: new Date(0), end: now };
  }
  return { start, end: now };
}

export default function StatisticsPage() {
  const { transactions, categories, getCategory, getWallet, loading } =
    useData();
  const [range, setRange] = useState("month");

  const { start, end } = getRange(range);

  async function handleExportRange(format) {
    if (filtered.length === 0) {
      toast.error(
        "Không có dữ liệu trong khoảng thời gian này để xuất báo cáo.",
      );
      return;
    }
    const rangeLabel =
      RANGE_OPTIONS.find((r) => r.id === range)?.label || "Báo cáo";
    try {
      await exportRangeReport({
        title: rangeLabel,
        start,
        end,
        transactions,
        categories,
        getCategory,
        getWallet,
        format,
      });
      toast.success("Đã xuất báo cáo.");
    } catch (err) {
      console.error(err);
      toast.error("Không thể xuất báo cáo. Vui lòng thử lại.");
    }
  }

  const filtered = useMemo(
    () =>
      transactions.filter(
        (t) => t.type !== "transfer" && t.date >= start && t.date <= end,
      ),
    [transactions, start, end],
  );

  const totals = useMemo(() => {
    const income = filtered
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = filtered
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [filtered]);

  const categoryData = useMemo(() => {
    const map = {};
    filtered
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
      });
    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map)
      .map(([id, value]) => {
        const cat = getCategory(id);
        return {
          name: cat?.name || "Khác",
          value,
          color: cat?.color || "#94A3B8",
          pct: total ? Math.round((value / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [filtered, getCategory]);

  const trendData = useMemo(() => {
    const map = {};
    filtered.forEach((t) => {
      const key =
        range === "year" || range === "all"
          ? `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, "0")}`
          : formatDateShort(t.date);
      if (!map[key])
        map[key] = { key, thu: 0, chi: 0, order: t.date.getTime() };
      if (t.type === "income") map[key].thu += t.amount;
      else map[key].chi += t.amount;
    });
    return Object.values(map).sort((a, b) => a.order - b.order);
  }, [filtered, range]);

  const incomeVsExpense = [
    { name: "Thu nhập", value: totals.income, fill: "#10B981" },
    { name: "Chi tiêu", value: totals.expense, fill: "#F43F5E" },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setRange(opt.id)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                range === opt.id
                  ? "border-accent-500 bg-accent-50 text-accent-700 dark:border-accent-500/50 dark:bg-accent-500/10 dark:text-accent-400"
                  : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <ExportMenu
          label={`Xuất báo cáo ${RANGE_OPTIONS.find((r) => r.id === range)?.label.toLowerCase()}`}
          onSelect={handleExportRange}
        />
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-600 to-accent-700 p-5 text-white shadow-lg shadow-accent-600/20 sm:p-6">
        <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/10" />
        <div className="relative grid grid-cols-3 gap-3 sm:gap-6">
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[11px] text-white/70 sm:text-xs">
              <Icon name="receipt_long" size={13} /> Giao dịch
            </p>
            <p className="mt-1.5 text-2xl font-extrabold tabular-nums sm:text-4xl">
              {filtered.length}
            </p>
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[11px] text-white/70 sm:text-xs">
              <Icon name="arrow_upward" size={13} /> Thu nhập
            </p>
            <p className="mt-1.5 truncate text-lg font-extrabold tabular-nums text-emerald-200 sm:text-3xl">
              {formatMoney(totals.income)}
            </p>
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[11px] text-white/70 sm:text-xs">
              <Icon name="arrow_downward" size={13} /> Chi tiêu
            </p>
            <p className="mt-1.5 truncate text-lg font-extrabold tabular-nums text-rose-200 sm:text-3xl">
              {formatMoney(totals.expense)}
            </p>
          </div>
        </div>
        <div className="relative mt-4 flex items-center gap-2 border-t border-white/15 pt-3.5 text-sm font-semibold sm:text-base">
          <Icon
            name={totals.net >= 0 ? "trending_up" : "trending_down"}
            size={18}
          />
          Chênh lệch:{" "}
          <span className="tabular-nums">{formatMoney(totals.net)}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <EmptyState
            icon="bar_chart"
            text="Không có dữ liệu trong khoảng thời gian này."
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ChartCard
              title="Xu hướng thu chi"
              subtitle={`Tổng thu ${formatMoney(totals.income)} · Tổng chi ${formatMoney(totals.expense)}`}
            >
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={trendData}
                  margin={{ left: 4, right: 8, top: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="text-zinc-100 dark:text-zinc-800"
                    stroke="currentColor"
                  />
                  <XAxis
                    dataKey="key"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      v >= 1000000
                        ? `${v / 1000000}tr`
                        : v >= 1000
                          ? `${v / 1000}k`
                          : v
                    }
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    label={{
                      value: "Số tiền (đ)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 10, fill: "#94a3b8" },
                    }}
                  />
                  <Tooltip
                    formatter={(v) => formatMoney(v)}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(value) => (
                      <span className="text-zinc-600 dark:text-zinc-300">
                        {value}
                      </span>
                    )}
                  />
                  <Line
                    type="monotone"
                    dataKey="thu"
                    name="Thu nhập"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="chi"
                    name="Chi tiêu"
                    stroke="#F43F5E"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="So sánh thu / chi"
              subtitle={`Chênh lệch ${totals.net >= 0 ? "+" : ""}${formatMoney(totals.net)}`}
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={incomeVsExpense}
                  margin={{ left: 4, right: 8, top: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="text-zinc-100 dark:text-zinc-800"
                    stroke="currentColor"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) =>
                      v >= 1000000
                        ? `${v / 1000000}tr`
                        : v >= 1000
                          ? `${v / 1000}k`
                          : v
                    }
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    label={{
                      value: "Số tiền (đ)",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 10, fill: "#94a3b8" },
                    }}
                  />
                  <Tooltip
                    formatter={(v) => formatMoney(v)}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                  <Bar
                    dataKey="value"
                    name="Số tiền"
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={false}
                  >
                    {incomeVsExpense.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="value"
                      position="top"
                      formatter={(v) => formatCompactMoney(v)}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        fill: "currentColor",
                      }}
                      className="text-zinc-600 dark:text-zinc-300"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ChartCard
              title="Phân bổ chi tiêu theo danh mục"
              subtitle={
                categoryData.length > 0
                  ? `Tổng ${formatMoney(totals.expense)} · ${categoryData.length} danh mục`
                  : undefined
              }
            >
              {categoryData.length === 0 ? (
                <EmptyState
                  icon="donut_large"
                  text="Chưa có chi tiêu trong khoảng thời gian này."
                />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      isAnimationActive={false}
                      label={({ pct }) => `${pct}%`}
                      labelLine={false}
                      style={{ fontSize: 11, fontWeight: 600 }}
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, n, { payload }) => [
                        `${formatMoney(v)} (${payload.pct}%)`,
                        payload.name,
                      ]}
                      contentStyle={{ borderRadius: 12, fontSize: 12 }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11 }}
                      formatter={(value) => (
                        <span className="text-zinc-600 dark:text-zinc-300">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard
              title="Chi tiêu theo danh mục (%)"
              subtitle={
                categoryData.length > 0
                  ? `Cao nhất: ${categoryData[0].name} (${categoryData[0].pct}%)`
                  : undefined
              }
            >
              {categoryData.length === 0 ? (
                <EmptyState icon="bar_chart" text="Chưa có dữ liệu." />
              ) : (
                <div className="space-y-3">
                  {categoryData.map((c) => (
                    <div key={c.name}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 font-medium text-zinc-600 dark:text-zinc-300">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                          {c.name}
                        </span>
                        <span className="tabular-nums text-zinc-400">
                          {formatMoney(c.value)} · {c.pct}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${c.pct}%`,
                            backgroundColor: c.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="animate-fade-in rounded-2xl border border-zinc-100 bg-white p-5 transition duration-200 hover:shadow-md hover:shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-black/20">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-zinc-400">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
