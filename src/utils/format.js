export function formatMoney(amount) {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${new Intl.NumberFormat('vi-VN').format(n)}đ`;
  }
}

export function formatNumber(n) {
  return new Intl.NumberFormat('vi-VN').format(Number(n) || 0);
}

// Parses a formatted money string like "1.500.000" back to a raw number
export function parseMoneyInput(str) {
  if (typeof str === 'number') return str;
  if (!str) return 0;
  const cleaned = String(str).replace(/[^\d-]/g, '');
  return cleaned ? parseInt(cleaned, 10) : 0;
}

export function formatDate(date, opts = {}) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...opts,
  }).format(d);
}

export function formatDateShort(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(d);
}

export function formatDateTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function toInputDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function toInputTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '00:00';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function toInputDateTimeLocal(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

export function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(d);
}

const WEEKDAY_NAMES = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

// e.g. "Thứ 3, 22/09/2026" - used as the sticky section header when grouping
// the transaction list by day.
export function formatDayHeader(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return `${WEEKDAY_NAMES[d.getDay()]}, ${formatDate(d)}`;
}

// "YYYY-MM-DD" key for grouping a list of transactions by calendar day
// (local time, not UTC).
export function dayKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function monthStartInput(date = new Date()) {
  return toInputDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function monthEndInput(date = new Date()) {
  return toInputDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

// Parses a "YYYY-MM-DD" input value as a LOCAL date (avoids the UTC-midnight
// shift that plain `new Date(str)` introduces in non-UTC timezones).
export function parseLocalDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function parseLocalDateEnd(str) {
  const d = parseLocalDate(str);
  if (!d) return null;
  d.setHours(23, 59, 59, 999);
  return d;
}

export function formatCompactMoney(n) {
  const num = Number(n) || 0;
  const abs = Math.abs(num);
  if (abs >= 1000000) {
    const v = num / 1000000;
    return `${Number.isInteger(v) ? v : v.toFixed(1)}tr`;
  }
  if (abs >= 1000) return `${Math.round(num / 1000)}k`;
  return String(num);
}

export function monthKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function isSameMonth(dateA, monthKeyStr) {
  return monthKey(dateA) === monthKeyStr;
}
