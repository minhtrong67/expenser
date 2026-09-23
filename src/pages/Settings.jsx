import { useRef, useState } from "react";
import toast from "react-hot-toast";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import TextInput from "../components/ui/TextInput";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import { useData } from "../contexts/DataContext";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { isNonEmpty, isStrongPassword, maxLength } from "../utils/validators";
import {
  exportCSV,
  exportExcel,
  exportJSON,
  parseImportFile,
} from "../utils/exportImport";

const THEME_MODES = [
  { id: "light", label: "Sáng", icon: "light_mode" },
  { id: "dark", label: "Tối", icon: "dark_mode" },
  { id: "system", label: "Hệ thống", icon: "brightness_auto" },
];

const FONT_SIZES = [
  { id: "sm", label: "Nhỏ" },
  { id: "md", label: "Vừa" },
  { id: "lg", label: "Lớn" },
  { id: "xl", label: "Rất lớn" },
];

function SettingsSection({ title, icon, description, children }) {
  return (
    <section className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600 dark:bg-accent-500/10">
          <Icon name={icon} size={20} />
        </span>
        <div>
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs text-zinc-400">{description}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}

function SettingRow({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          {label}
        </p>
        {hint && <p className="text-xs text-zinc-400">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout, updateDisplayName, changePassword } = useAuth();
  const { settings, update, resetSettings } = useSettings();
  const {
    transactions,
    categories,
    wallets,
    loading: dataLoading,
    getCategory,
    getWallet,
    addCategory,
    addWallet,
    addTransaction,
  } = useData();
  const { canInstall, installed, promptInstall } = usePwaInstall();

  const [name, setName] = useState(user?.displayName || "");
  const [nameSaving, setNameSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportingType, setExportingType] = useState(null);
  const [importBusy, setImportBusy] = useState(false);
  const fileRef = useRef(null);

  async function handleSaveName(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!isNonEmpty(trimmed)) return toast.error("Vui lòng nhập họ tên.");
    if (!maxLength(trimmed, 60)) return toast.error("Họ tên tối đa 60 ký tự.");
    setNameSaving(true);
    try {
      await updateDisplayName(trimmed);
      toast.success("Đã cập nhật họ tên.");
    } catch {
      toast.error("Không thể cập nhật.");
    } finally {
      setNameSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    const errs = {};
    if (!isNonEmpty(pwForm.current)) errs.current = "Nhập mật khẩu hiện tại.";
    if (!isStrongPassword(pwForm.next))
      errs.next = "Mật khẩu mới tối thiểu 6 ký tự.";
    if (pwForm.confirm !== pwForm.next)
      errs.confirm = "Mật khẩu nhập lại không khớp.";
    setPwErrors(errs);
    if (Object.keys(errs).length) return;
    setPwSaving(true);
    const res = await changePassword(pwForm.current, pwForm.next);
    setPwSaving(false);
    if (res.success) {
      toast.success("Đã đổi mật khẩu thành công.");
      setPwForm({ current: "", next: "", confirm: "" });
      setPwOpen(false);
    } else {
      toast.error(res.error);
    }
  }

  async function handleInstallClick() {
    setInstalling(true);
    const accepted = await promptInstall();
    setInstalling(false);
    if (accepted) toast.success("Đã cài đặt ứng dụng thành công!");
    else if (!canInstall)
      toast.error(
        'Trình duyệt của bạn chưa hỗ trợ cài đặt trực tiếp. Hãy dùng menu "Thêm vào màn hình chính" của trình duyệt.',
      );
  }

  async function handleExport(type) {
    const realTx = transactions.filter((t) => t.type !== "transfer");
    if (realTx.length === 0) {
      setExportOpen(false);
      return toast.error("Chưa có giao dịch nào để xuất.");
    }
    setExportingType(type);
    try {
      if (type === "csv")
        exportCSV(realTx, getCategory, getWallet, "du-lieu-chi-tieu");
      if (type === "excel")
        await exportExcel(realTx, getCategory, getWallet, "du-lieu-chi-tieu");
      if (type === "json")
        exportJSON(realTx, getCategory, getWallet, "du-lieu-chi-tieu");
      toast.success("Đã xuất toàn bộ dữ liệu.");
    } catch (err) {
      console.error(err);
      toast.error("Không thể xuất dữ liệu. Vui lòng thử lại.");
    } finally {
      setExportingType(null);
      setExportOpen(false);
    }
  }

  async function handleImportFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImportBusy(true);
    try {
      const { rows, errors } = await parseImportFile(file);
      const catMap = new Map(
        categories.map((c) => [`${c.type}:${c.name.toLowerCase()}`, c.id]),
      );
      const walletMap = new Map(
        wallets.map((w) => [w.name.toLowerCase(), w.id]),
      );
      let imported = 0;

      for (const row of rows) {
        const catKey = `${row.type}:${row.categoryName.toLowerCase()}`;
        let catId = catMap.get(catKey);
        if (!catId) {
          catId = await addCategory({
            name: row.categoryName,
            type: row.type,
            emoji: "🏷️",
            color: "#64748B",
          });
          catMap.set(catKey, catId);
        }
        const walletKey = row.walletName.toLowerCase();
        let walletId = walletMap.get(walletKey);
        if (!walletId) {
          walletId = await addWallet({
            name: row.walletName,
            icon: "account_balance_wallet",
            color: "#64748B",
            balance: 0,
          });
          walletMap.set(walletKey, walletId);
        }
        await addTransaction({
          type: row.type,
          amount: row.amount,
          categoryId: catId,
          walletId,
          date: row.date,
          note: row.note,
        });
        imported += 1;
      }

      if (imported > 0)
        toast.success(`Đã nhập ${imported} giao dịch thành công.`);
      if (errors.length)
        toast.error(
          `${errors.length} dòng bị bỏ qua do thiếu hoặc sai dữ liệu.`,
        );
      if (rows.length === 0 && errors.length === 0)
        toast.error("File không có dữ liệu hợp lệ.");
    } catch (err) {
      console.error(err);
      toast.error(
        "Không thể nhập file. Vui lòng kiểm tra định dạng CSV, Excel hoặc JSON.",
      );
    } finally {
      setImportBusy(false);
    }
  }

  const isGoogleUser = user?.providerData?.[0]?.providerId === "google.com";

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-in pb-6">
      {/* Prominent PWA install card - only shown when not yet installed */}
      {!installed && (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-600 to-accent-700 p-6 text-white shadow-lg shadow-accent-600/20 sm:p-7">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-16 -left-6 h-40 w-40 rounded-full bg-white/10" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Icon name="install_mobile" size={26} />
              </span>
              <div>
                <h2 className="text-base font-bold">
                  Cài đặt ứng dụng lên thiết bị
                </h2>
                <p className="mt-1 max-w-md text-sm text-white/80">
                  Cài "Expenser" như một ứng dụng thật để mở nhanh hơn, dùng
                  được khi mất mạng và có icon riêng trên màn hình chính.
                </p>
              </div>
            </div>
            <Button
              onClick={handleInstallClick}
              loading={installing}
              className="!bg-white !text-accent-700 shrink-0 hover:!bg-white/90"
              icon="download"
            >
              Cài đặt ngay
            </Button>
          </div>
        </section>
      )}

      {/* Profile */}
      <SettingsSection
        title="Tài khoản"
        icon="person"
        description="Thông tin cá nhân và bảo mật"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent-100 text-xl font-bold text-accent-700 dark:bg-accent-500/20 dark:text-accent-400">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              (user?.displayName || user?.email || "?")[0]?.toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {user?.displayName || "Chưa đặt tên"}
            </p>
            <p className="truncate text-xs text-zinc-400">{user?.email}</p>
          </div>
        </div>

        <form
          onSubmit={handleSaveName}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <Field label="Họ và tên">
              <TextInput
                icon="badge"
                value={name}
                maxLength={60}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => setName(e.target.value.trim())}
              />
            </Field>
          </div>
          <Button type="submit" icon="check" loading={nameSaving}>
            Lưu
          </Button>
        </form>

        {!isGoogleUser && (
          <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800">
            <SettingRow label="Mật khẩu" hint="Đổi mật khẩu đăng nhập của bạn">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPwOpen((o) => !o)}
              >
                {pwOpen ? "Đóng" : "Đổi mật khẩu"}
              </Button>
            </SettingRow>
            {pwOpen && (
              <form
                onSubmit={handleChangePassword}
                className="mt-4 grid grid-cols-1 gap-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50"
              >
                <Field label="Mật khẩu hiện tại" error={pwErrors.current}>
                  <TextInput
                    type="password"
                    icon="lock"
                    value={pwForm.current}
                    onChange={(e) =>
                      setPwForm((f) => ({ ...f, current: e.target.value }))
                    }
                    error={pwErrors.current}
                  />
                </Field>
                <Field
                  label="Mật khẩu mới"
                  error={pwErrors.next}
                  hint="Tối thiểu 6 ký tự"
                >
                  <TextInput
                    type="password"
                    icon="lock_reset"
                    value={pwForm.next}
                    onChange={(e) =>
                      setPwForm((f) => ({ ...f, next: e.target.value }))
                    }
                    error={pwErrors.next}
                  />
                </Field>
                <Field label="Nhập lại mật khẩu mới" error={pwErrors.confirm}>
                  <TextInput
                    type="password"
                    icon="lock_reset"
                    value={pwForm.confirm}
                    onChange={(e) =>
                      setPwForm((f) => ({ ...f, confirm: e.target.value }))
                    }
                    error={pwErrors.confirm}
                  />
                </Field>
                <Button
                  type="submit"
                  icon="check"
                  loading={pwSaving}
                  className="w-full sm:w-auto sm:self-end"
                >
                  Lưu
                </Button>
              </form>
            )}
          </div>
        )}

        <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <SettingRow label="Đăng xuất" hint="Đăng xuất khỏi thiết bị này">
            <Button
              variant="danger"
              size="sm"
              icon="logout"
              onClick={() => setLogoutOpen(true)}
            >
              Đăng xuất
            </Button>
          </SettingRow>
        </div>
      </SettingsSection>

      {/* Appearance */}
      <SettingsSection
        title="Giao diện"
        icon="palette"
        description="Tùy chỉnh giao diện sáng / tối"
      >
        <SettingRow label="Chế độ hiển thị">
          <div className="grid w-full grid-cols-3 gap-2 sm:w-auto">
            {THEME_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => update({ themeMode: m.id })}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border px-3.5 py-3 text-xs font-semibold transition sm:text-sm ${
                  settings.themeMode === m.id
                    ? "border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400"
                    : "border-zinc-200 text-zinc-500 dark:border-zinc-700"
                }`}
              >
                <Icon name={m.icon} size={16} className="flex-shrink-0" />{" "}
                {m.label}
              </button>
            ))}
          </div>
        </SettingRow>
      </SettingsSection>

      {/* Font size */}
      <SettingsSection
        title="Cỡ chữ"
        icon="format_size"
        description="Điều chỉnh kích thước chữ hiển thị trên toàn ứng dụng"
      >
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {FONT_SIZES.map((f) => (
            <button
              key={f.id}
              onClick={() => update({ fontSize: f.id })}
              className={`rounded-xl border px-3.5 py-3.5 text-sm font-semibold transition ${
                settings.fontSize === f.id
                  ? "border-accent-500 bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-400"
                  : "border-zinc-200 text-zinc-500 dark:border-zinc-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </SettingsSection>

      {/* App / Data */}
      <SettingsSection
        title="Ứng dụng & Dữ liệu"
        icon="apps"
        description="Xuất, nhập và khôi phục dữ liệu"
      >
        <SettingRow
          label="Xuất dữ liệu"
          hint="Xuất toàn bộ giao dịch ra file CSV, Excel hoặc JSON"
        >
          <div className="relative">
            <Button
              size="sm"
              icon="download"
              loading={!!exportingType}
              disabled={dataLoading}
              onClick={() => setExportOpen((o) => !o)}
              className="w-full"
            >
              Xuất dữ liệu
            </Button>
            {exportOpen && (
              <div className="absolute right-0 z-10 mt-1.5 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1.5 shadow-lg animate-scale-in dark:border-zinc-700 dark:bg-zinc-900">
                {[
                  { id: "csv", label: "CSV" },
                  { id: "excel", label: "Excel (.xlsx)" },
                  { id: "json", label: "JSON" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleExport(opt.id)}
                    disabled={!!exportingType}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {opt.label}
                    {exportingType === opt.id && (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </SettingRow>
        <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <SettingRow
            label="Nhập dữ liệu"
            hint="Nhập giao dịch từ file CSV, Excel hoặc JSON"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              className="hidden"
              onChange={handleImportFile}
            />
            <Button
              variant="secondary"
              size="sm"
              icon="upload_file"
              loading={importBusy}
              disabled={dataLoading}
              onClick={() => fileRef.current?.click()}
            >
              Nhập dữ liệu
            </Button>
          </SettingRow>
        </div>
        <div className="border-t border-zinc-100 pt-5 dark:border-zinc-800">
          <SettingRow
            label="Khôi phục cài đặt mặc định"
            hint="Đặt lại giao diện và cỡ chữ về mặc định"
          >
            <Button
              variant="danger"
              size="sm"
              icon="restart_alt"
              onClick={() => setResetOpen(true)}
            >
              Khôi phục
            </Button>
          </SettingRow>
        </div>
      </SettingsSection>

      <p className="pb-2 text-center text-xs text-zinc-400">
        Expenser · Phiên bản 1.0.0 · Được phát triển bởi minhtrong67 với sự hỗ
        trợ của Claude (Anthropic)
      </p>

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={async () => {
          setLoggingOut(true);
          try {
            await logout();
          } finally {
            setLoggingOut(false);
            setLogoutOpen(false);
          }
        }}
        danger
        loading={loggingOut}
        confirmText="Đăng xuất"
        confirmIcon="logout"
        message="Bạn có chắc muốn đăng xuất khỏi tài khoản này?"
      />
      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={async () => {
          setResetting(true);
          resetSettings();
          await new Promise((r) => setTimeout(r, 200));
          setResetting(false);
          setResetOpen(false);
          toast.success("Đã khôi phục cài đặt mặc định.");
        }}
        danger={false}
        loading={resetting}
        confirmText="Khôi phục"
        confirmIcon="restart_alt"
        message="Khôi phục toàn bộ cài đặt giao diện về mặc định?"
      />
    </div>
  );
}
