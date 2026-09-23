import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate, formatMoney, formatTime, monthKey } from './format';

const APP_NAME = 'Expenser';

// Brand palette (zinc neutrals + accent hues) reused across PDF/Excel reports
const COLOR = {
  zinc900: [24, 24, 27],
  zinc600: [82, 82, 91],
  zinc300: [212, 212, 216],
  zinc100: [244, 244, 245],
  emerald: [22, 163, 74],
  amber: [217, 119, 6],
  rose: [225, 29, 72],
};
const HEX = {
  zinc900: 'FF18181B',
  zinc700: 'FF3F3F46',
  zinc600: 'FF52525B',
  zinc200: 'FFE4E4E7',
  zinc100: 'FFF4F4F5',
  white: 'FFFFFFFF',
  emerald: 'FF16A34A',
  amber: 'FFD97706',
  rose: 'FFE11D48',
};

function buildRows(transactions, getCategory, getWallet) {
  return transactions.map((t) => ({
    'Ngày': formatDate(t.date),
    'Giờ': formatTime(t.date),
    'Loại': t.type === 'income' ? 'Thu' : t.type === 'expense' ? 'Chi' : 'Chuyển khoản',
    'Danh mục': getCategory(t.categoryId)?.name || '',
    'Ví': getWallet(t.walletId)?.name || '',
    'Số tiền': t.amount,
    'Ghi chú': t.note || '',
  }));
}

function computeCategoryBreakdown(tx, getCategory) {
  const catMap = {};
  const expense = tx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  tx.filter((t) => t.type === 'expense').forEach((t) => {
    if (!catMap[t.categoryId]) catMap[t.categoryId] = { total: 0, count: 0 };
    catMap[t.categoryId].total += t.amount;
    catMap[t.categoryId].count += 1;
  });
  const catRows = Object.entries(catMap)
    .map(([id, v]) => ({
      'Danh mục': getCategory(id)?.name || 'Khác',
      'Số giao dịch': v.count,
      'Tổng chi': v.total,
      'Tỷ lệ (%)': expense > 0 ? Math.round((v.total / expense) * 100) : 0,
    }))
    .sort((a, b) => b['Tổng chi'] - a['Tổng chi']);
  return { catMap, catRows };
}

// ---------------------------------------------------------------------------
// Vietnamese font support for jsPDF
// ---------------------------------------------------------------------------
// jsPDF's built-in fonts (helvetica/times/courier) only support the WinAnsi
// character set and cannot render Vietnamese diacritics (ệ, ư, ơ, đ...). We
// embed a Roboto subset (Latin + Vietnamese, merged) as a real TTF so exported
// PDFs render Vietnamese text correctly. Loaded lazily so it doesn't bloat the
// main bundle — it's only needed when a PDF is actually generated.
async function loadVietnameseFont(doc) {
  const { ROBOTO_VN_REGULAR_BASE64, ROBOTO_VN_BOLD_BASE64 } = await import('../assets/fonts/robotoVietnamese.js');
  doc.addFileToVFS('RobotoVN-Regular.ttf', ROBOTO_VN_REGULAR_BASE64);
  doc.addFont('RobotoVN-Regular.ttf', 'RobotoVN', 'normal');
  doc.addFileToVFS('RobotoVN-Bold.ttf', ROBOTO_VN_BOLD_BASE64);
  doc.addFont('RobotoVN-Bold.ttf', 'RobotoVN', 'bold');
  doc.setFont('RobotoVN', 'normal');
  return doc;
}

function pdfHeaderBanner(doc, title, subtitle) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(...COLOR.zinc900);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('RobotoVN', 'bold');
  doc.setFontSize(13);
  doc.text(APP_NAME, 14, 12);
  doc.setFontSize(10.5);
  doc.text(title, 14, 20);
  doc.setFont('RobotoVN', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR.zinc300);
  doc.text(subtitle, 14, 26);
  doc.setTextColor(0, 0, 0);
  return 40;
}

function pdfFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFont('RobotoVN', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLOR.zinc600);
    doc.text(APP_NAME, 14, pageHeight - 8);
    doc.text(`Trang ${i}/${pageCount}`, pageWidth - 14, pageHeight - 8, { align: 'right' });
  }
  doc.setTextColor(0, 0, 0);
}

function pdfSectionHeading(doc, text, y) {
  doc.setFont('RobotoVN', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR.zinc900);
  doc.text(text, 14, y);
  doc.setFont('RobotoVN', 'normal');
  doc.setTextColor(0, 0, 0);
}

const AUTOTABLE_BASE = {
  styles: { font: 'RobotoVN', fontSize: 8.5, cellPadding: 3, textColor: [39, 39, 42] },
  headStyles: { font: 'RobotoVN', fontStyle: 'bold', textColor: 255, fontSize: 8.5 },
  alternateRowStyles: { fillColor: COLOR.zinc100 },
  margin: { left: 14, right: 14 },
};

// ---------------------------------------------------------------------------
// Simple transaction list export (Transactions page)
// ---------------------------------------------------------------------------

export function exportCSV(transactions, getCategory, getWallet, filename = 'giao-dich') {
  const rows = buildRows(transactions, getCategory, getWallet);
  const csv = Papa.unparse(rows);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

export async function exportExcel(transactions, getCategory, getWallet, filename = 'giao-dich') {
  const ExcelJS = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  wb.creator = APP_NAME;
  wb.created = new Date();

  const ws = wb.addWorksheet('Giao dịch', { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = [
    { header: 'Ngày', key: 'date', width: 12 },
    { header: 'Giờ', key: 'time', width: 8 },
    { header: 'Loại', key: 'type', width: 12 },
    { header: 'Danh mục', key: 'category', width: 20 },
    { header: 'Ví', key: 'wallet', width: 18 },
    { header: 'Số tiền', key: 'amount', width: 16 },
    { header: 'Ghi chú', key: 'note', width: 34 },
  ];
  transactions.forEach((t) => {
    ws.addRow({
      date: formatDate(t.date),
      time: formatTime(t.date),
      type: t.type === 'income' ? 'Thu' : t.type === 'expense' ? 'Chi' : 'Chuyển khoản',
      category: getCategory(t.categoryId)?.name || '',
      wallet: getWallet(t.walletId)?.name || '',
      amount: t.amount,
      note: t.note || '',
    });
  });
  styleHeaderRow(ws.getRow(1), HEX.zinc900);
  ws.getColumn('amount').numFmt = '#,##0" đ"';
  zebraStripe(ws, 2, ws.rowCount);
  if (ws.rowCount > 1) ws.autoFilter = { from: 'A1', to: { row: 1, column: 7 } };

  await downloadWorkbook(wb, `${filename}.xlsx`);
}

export async function exportPDF(transactions, getCategory, getWallet, filename = 'giao-dich') {
  const doc = new jsPDF();
  await loadVietnameseFont(doc);
  const rows = buildRows(transactions, getCategory, getWallet);
  const startY = pdfHeaderBanner(doc, 'Danh sách giao dịch', `${rows.length} giao dịch · Xuất ngày ${formatDate(new Date())}`);
  autoTable(doc, {
    ...AUTOTABLE_BASE,
    startY,
    head: [['Ngày', 'Giờ', 'Loại', 'Danh mục', 'Ví', 'Số tiền', 'Ghi chú']],
    body: rows.map((r) => [r['Ngày'], r['Giờ'], r['Loại'], r['Danh mục'], r['Ví'], formatMoney(r['Số tiền']), r['Ghi chú']]),
    headStyles: { ...AUTOTABLE_BASE.headStyles, fillColor: COLOR.zinc900 },
    columnStyles: { 5: { halign: 'right' } },
  });
  pdfFooter(doc);
  doc.save(`${filename}.pdf`);
}

// ---------------------------------------------------------------------------
// Comprehensive report builder (used by the Statistics page's period export)
// ---------------------------------------------------------------------------

async function buildReportPDF({ title, start, end, income, expense, count, categoryRows, detailRows }) {
  const doc = new jsPDF();
  await loadVietnameseFont(doc);
  const subtitle = `Từ ${formatDate(start)} đến ${formatDate(end)} · Xuất ngày ${formatDate(new Date())}`;
  let lastY = pdfHeaderBanner(doc, title, subtitle);

  autoTable(doc, {
    startY: lastY,
    theme: 'plain',
    margin: { left: 14, right: 14 },
    body: [
      ['Tổng thu nhập', formatMoney(income)],
      ['Tổng chi tiêu', formatMoney(expense)],
      ['Chênh lệch (Thu - Chi)', formatMoney(income - expense)],
      ['Tổng số giao dịch', String(count)],
    ],
    styles: { font: 'RobotoVN', fontSize: 10, cellPadding: 1.8 },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: COLOR.zinc600, cellWidth: 65 },
      1: { textColor: COLOR.zinc900 },
    },
  });
  lastY = doc.lastAutoTable.finalY + 10;

  if (categoryRows?.length) {
    pdfSectionHeading(doc, 'Chi tiêu theo danh mục', lastY);
    autoTable(doc, {
      ...AUTOTABLE_BASE,
      startY: lastY + 4,
      head: [['Danh mục', 'Số GD', 'Tổng chi', 'Tỷ lệ']],
      body: categoryRows.map((r) => [r['Danh mục'], r['Số giao dịch'], formatMoney(r['Tổng chi']), `${r['Tỷ lệ (%)']}%`]),
      headStyles: { ...AUTOTABLE_BASE.headStyles, fillColor: COLOR.emerald },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
    });
    lastY = doc.lastAutoTable.finalY + 10;
  }

  pdfSectionHeading(doc, 'Chi tiết giao dịch', lastY);
  autoTable(doc, {
    ...AUTOTABLE_BASE,
    startY: lastY + 4,
    head: [['Ngày', 'Giờ', 'Loại', 'Danh mục', 'Ví', 'Số tiền', 'Ghi chú']],
    body: detailRows.map((r) => [r['Ngày'], r['Giờ'], r['Loại'], r['Danh mục'], r['Ví'], formatMoney(r['Số tiền']), r['Ghi chú']]),
    headStyles: { ...AUTOTABLE_BASE.headStyles, fillColor: COLOR.zinc600 },
    styles: { ...AUTOTABLE_BASE.styles, fontSize: 7.5 },
    columnStyles: { 5: { halign: 'right' } },
  });

  pdfFooter(doc);
  return doc;
}

async function buildExcelReport({ title, subtitle, income, expense, count, extraOverviewRows = [], categoryRows, detailRows }) {
  const ExcelJS = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  wb.creator = APP_NAME;
  wb.created = new Date();

  // Sheet 1: Overview
  const wsOv = wb.addWorksheet('Tổng quan');
  wsOv.mergeCells('A1:B1');
  wsOv.getCell('A1').value = title;
  wsOv.getCell('A1').font = { bold: true, size: 14, color: { argb: HEX.zinc900 } };
  wsOv.mergeCells('A2:B2');
  wsOv.getCell('A2').value = subtitle;
  wsOv.getCell('A2').font = { italic: true, size: 9.5, color: { argb: HEX.zinc600 } };
  wsOv.getColumn(1).width = 30;
  wsOv.getColumn(2).width = 24;

  const headerRowIdx = 4;
  wsOv.getRow(headerRowIdx).values = ['Chỉ số', 'Giá trị'];
  styleHeaderRow(wsOv.getRow(headerRowIdx), HEX.zinc900);

  const overviewData = [
    ['Tổng thu nhập', income],
    ['Tổng chi tiêu', expense],
    ['Chênh lệch (Thu - Chi)', income - expense],
    ['Tổng số giao dịch', count],
    ...extraOverviewRows,
  ];
  overviewData.forEach((r) => wsOv.addRow(r));
  for (let i = headerRowIdx + 1; i <= wsOv.rowCount; i += 1) {
    const cell = wsOv.getCell(i, 2);
    if (typeof cell.value === 'number') cell.numFmt = '#,##0" đ"';
    wsOv.getCell(i, 1).font = { bold: true, color: { argb: HEX.zinc700 } };
  }
  zebraStripe(wsOv, headerRowIdx + 1, wsOv.rowCount);

  // Sheet 2: Category breakdown
  const wsCat = wb.addWorksheet('Theo danh mục', { views: [{ state: 'frozen', ySplit: 1 }] });
  wsCat.columns = [
    { header: 'Danh mục', key: 'cat', width: 24 },
    { header: 'Số giao dịch', key: 'count', width: 15 },
    { header: 'Tổng chi', key: 'total', width: 18 },
    { header: 'Tỷ lệ (%)', key: 'pct', width: 12 },
  ];
  styleHeaderRow(wsCat.getRow(1), HEX.emerald);
  categoryRows.forEach((r) => wsCat.addRow({ cat: r['Danh mục'], count: r['Số giao dịch'], total: r['Tổng chi'], pct: r['Tỷ lệ (%)'] }));
  wsCat.getColumn('total').numFmt = '#,##0" đ"';
  zebraStripe(wsCat, 2, wsCat.rowCount);
  if (wsCat.rowCount > 1) wsCat.autoFilter = { from: 'A1', to: { row: 1, column: 4 } };

  // Sheet 3: Full transaction detail
  const wsDet = wb.addWorksheet('Chi tiết giao dịch', { views: [{ state: 'frozen', ySplit: 1 }] });
  wsDet.columns = [
    { header: 'Ngày', key: 'date', width: 12 },
    { header: 'Giờ', key: 'time', width: 8 },
    { header: 'Loại', key: 'type', width: 12 },
    { header: 'Danh mục', key: 'cat', width: 20 },
    { header: 'Ví', key: 'wallet', width: 18 },
    { header: 'Số tiền', key: 'amount', width: 16 },
    { header: 'Ghi chú', key: 'note', width: 34 },
  ];
  styleHeaderRow(wsDet.getRow(1), HEX.zinc600);
  detailRows.forEach((r) => wsDet.addRow({
    date: r['Ngày'], time: r['Giờ'], type: r['Loại'], cat: r['Danh mục'], wallet: r['Ví'], amount: r['Số tiền'], note: r['Ghi chú'],
  }));
  wsDet.getColumn('amount').numFmt = '#,##0" đ"';
  zebraStripe(wsDet, 2, wsDet.rowCount);
  if (wsDet.rowCount > 1) wsDet.autoFilter = { from: 'A1', to: { row: 1, column: 7 } };

  return wb;
}

/**
 * Generic period report — Excel (multi-sheet), PDF, or CSV — for an arbitrary
 * date range. Used by the Statistics page's quick-export.
 */
export async function exportRangeReport({ title, start, end, transactions, categories, getCategory, getWallet, format = 'excel' }) {
  const rangeTx = transactions.filter((t) => t.type !== 'transfer' && t.date >= start && t.date <= end);
  const income = rangeTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = rangeTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const detailRows = buildRows(rangeTx, getCategory, getWallet);
  const { catRows } = computeCategoryBreakdown(rangeTx, getCategory);
  const fname = `bao-cao-${formatDate(start).replaceAll('/', '-')}_${formatDate(end).replaceAll('/', '-')}`;

  if (format === 'csv') {
    const csv = Papa.unparse(detailRows);
    downloadBlob(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), `${fname}.csv`);
    return;
  }

  if (format === 'pdf') {
    const doc = await buildReportPDF({ title, start, end, income, expense, count: rangeTx.length, categoryRows: catRows, detailRows });
    doc.save(`${fname}.pdf`);
    return;
  }

  const wb = await buildExcelReport({
    title,
    subtitle: `Từ ${formatDate(start)} đến ${formatDate(end)} · Xuất ngày ${formatDate(new Date())}`,
    income, expense, count: rangeTx.length,
    categoryRows: catRows,
    detailRows,
  });
  await downloadWorkbook(wb, `${fname}.xlsx`);
}

// ---------------------------------------------------------------------------
// Excel styling helpers
// ---------------------------------------------------------------------------

function styleHeaderRow(row, fillHex) {
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { bold: true, color: { argb: HEX.white }, size: 10.5 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillHex } };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    cell.border = { bottom: { style: 'thin', color: { argb: fillHex } } };
  });
  row.height = 20;
}

function zebraStripe(ws, startRow, endRow) {
  for (let i = startRow; i <= endRow; i += 1) {
    const row = ws.getRow(i);
    const isStripe = (i - startRow) % 2 === 1;
    row.eachCell({ includeEmpty: true }, (cell) => {
      if (isStripe && !cell.fill) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEX.zinc100 } };
      }
      cell.border = { ...cell.border, bottom: { style: 'hair', color: { argb: HEX.zinc200 } } };
    });
  }
}

async function downloadWorkbook(wb, filename) {
  const buf = await wb.xlsx.writeBuffer();
  downloadBlob(new Blob([buf], { type: 'application/octet-stream' }), filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Import: CSV, Excel (.xlsx/.xls) and JSON — shared row normalization so all
// three formats are validated and parsed the exact same way.
// Expected columns (Vietnamese headers, case-insensitive): Ngày, Loại, Danh mục, Ví, Số tiền, Ghi chú
// ---------------------------------------------------------------------------

function normalizeImportRows(rawRows) {
  const rows = [];
  const errors = [];
  rawRows.forEach((raw, idx) => {
    const norm = {};
    Object.keys(raw || {}).forEach((k) => (norm[k.trim().toLowerCase()] = String(raw[k] ?? '').trim()));
    const dateStr = norm['ngày'] || norm['ngay'] || norm['date'];
    const typeStr = (norm['loại'] || norm['loai'] || norm['type'] || '').toLowerCase();
    const categoryName = norm['danh mục'] || norm['danh muc'] || norm['category'];
    const walletName = norm['ví'] || norm['vi'] || norm['wallet'];
    const amountStr = (norm['số tiền'] || norm['so tien'] || norm['amount'] || '').replace(/[^\d.-]/g, '');
    const note = norm['ghi chú'] || norm['ghi chu'] || norm['note'] || '';

    const rowNum = idx + 2;
    if (!dateStr || !amountStr || !categoryName || !walletName) {
      errors.push(`Dòng ${rowNum}: thiếu dữ liệu bắt buộc.`);
      return;
    }
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) {
      errors.push(`Dòng ${rowNum}: số tiền không hợp lệ.`);
      return;
    }
    const type = typeStr.includes('thu') || typeStr.includes('income') ? 'income' : 'expense';
    const date = new Date(String(dateStr).split('/').reverse().join('-')) || new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      errors.push(`Dòng ${rowNum}: ngày không hợp lệ.`);
      return;
    }
    rows.push({ date, type, categoryName: categoryName.trim(), walletName: walletName.trim(), amount, note: note.trim() });
  });
  return { rows, errors };
}

export function parseImportCSV(file) {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(normalizeImportRows(results.data)),
      error: () => resolve({ rows: [], errors: ['Không thể đọc file CSV.'] }),
    });
  });
}

export async function parseImportExcel(file) {
  try {
    const XLSX = await import('xlsx');
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: 'array', cellDates: true });
    const firstSheetName = wb.SheetNames[0];
    const sheet = wb.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
    return normalizeImportRows(data);
  } catch (err) {
    console.error(err);
    return { rows: [], errors: ['Không thể đọc file Excel. Vui lòng kiểm tra định dạng.'] };
  }
}

export async function parseImportJSON(file) {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const data = Array.isArray(parsed) ? parsed : parsed.transactions || parsed.rows || [];
    return normalizeImportRows(data);
  } catch (err) {
    console.error(err);
    return { rows: [], errors: ['Không thể đọc file JSON. Vui lòng kiểm tra định dạng.'] };
  }
}

/** Dispatches to the right parser based on file extension. */
export function parseImportFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv')) return parseImportCSV(file);
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return parseImportExcel(file);
  if (name.endsWith('.json')) return parseImportJSON(file);
  return Promise.resolve({ rows: [], errors: ['Định dạng file không được hỗ trợ. Hãy dùng CSV, Excel hoặc JSON.'] });
}

// ---------------------------------------------------------------------------
// JSON export — same row shape as CSV/Excel export, for the Transactions page
// ---------------------------------------------------------------------------

export function exportJSON(transactions, getCategory, getWallet, filename = 'giao-dich') {
  const rows = buildRows(transactions, getCategory, getWallet);
  const json = JSON.stringify(rows, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, `${filename}.json`);
}
