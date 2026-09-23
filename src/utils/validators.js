export function trimValue(v) {
  return typeof v === 'string' ? v.trim() : v;
}

export function trimAllFields(obj) {
  const out = {};
  for (const key of Object.keys(obj)) {
    out[key] = trimValue(obj[key]);
  }
  return out;
}

export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).trim());
}

export function isStrongPassword(pw) {
  return typeof pw === 'string' && pw.length >= 6;
}

export function isNonEmpty(v) {
  return typeof v === 'string' ? v.trim().length > 0 : v !== null && v !== undefined && v !== '';
}

export function isPositiveNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}

export function isValidDate(v) {
  const d = new Date(v);
  return !Number.isNaN(d.getTime());
}

export function maxLength(v, max) {
  return typeof v === 'string' ? v.trim().length <= max : true;
}

/**
 * Validate a transaction form payload.
 * Returns { valid, errors } where errors is a map of field -> message.
 */
export function validateTransaction(form) {
  const errors = {};
  const name = trimValue(form.note);
  if (!form.type || !['income', 'expense'].includes(form.type)) {
    errors.type = 'Vui lòng chọn loại giao dịch.';
  }
  if (!isPositiveNumber(form.amount)) {
    errors.amount = 'Số tiền phải lớn hơn 0.';
  }
  if (!isNonEmpty(form.categoryId)) {
    errors.categoryId = 'Vui lòng chọn danh mục.';
  }
  if (!isNonEmpty(form.walletId)) {
    errors.walletId = 'Vui lòng chọn ví/tài khoản.';
  }
  if (!isValidDate(form.date)) {
    errors.date = 'Ngày không hợp lệ.';
  } else if (new Date(form.date) > new Date(new Date().setHours(23, 59, 59, 999))) {
    errors.date = 'Ngày giao dịch không được ở tương lai.';
  }
  if (name && !maxLength(name, 200)) {
    errors.note = 'Ghi chú tối đa 200 ký tự.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateCategory(form, existingNames = []) {
  const errors = {};
  const name = trimValue(form.name);
  if (!isNonEmpty(name)) {
    errors.name = 'Tên danh mục không được để trống.';
  } else if (!maxLength(name, 40)) {
    errors.name = 'Tên danh mục tối đa 40 ký tự.';
  } else if (existingNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
    errors.name = 'Danh mục này đã tồn tại.';
  }
  if (!form.type || !['income', 'expense'].includes(form.type)) {
    errors.type = 'Vui lòng chọn loại danh mục.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateWallet(form, existingNames = []) {
  const errors = {};
  const name = trimValue(form.name);
  if (!isNonEmpty(name)) {
    errors.name = 'Tên ví không được để trống.';
  } else if (!maxLength(name, 40)) {
    errors.name = 'Tên ví tối đa 40 ký tự.';
  } else if (existingNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
    errors.name = 'Ví này đã tồn tại.';
  }
  if (form.balance === '' || form.balance === null || Number.isNaN(Number(form.balance))) {
    errors.balance = 'Số dư không hợp lệ.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
