// Validators return translated messages, so each takes the `t` function.
export function trimValue(v) {
  return typeof v === 'string' ? v.trim() : v;
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
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
  return !Number.isNaN(new Date(v).getTime());
}

export function maxLength(v, max) {
  return typeof v === 'string' ? v.trim().length <= max : true;
}

export const MAX_AMOUNT = 999_999_999_999;

/** Validate a transaction form payload -> { valid, errors: { field: message } } */
export function validateTransaction(form, t) {
  const errors = {};
  const note = trimValue(form.note);
  if (!form.type || !['income', 'expense'].includes(form.type)) errors.type = t('validation.typeRequired');
  if (!isPositiveNumber(form.amount)) errors.amount = t('validation.amountPositive');
  else if (Number(form.amount) > MAX_AMOUNT) errors.amount = t('validation.amountTooLarge');
  if (!isNonEmpty(form.categoryId)) errors.categoryId = t('validation.categoryRequired');
  if (!isNonEmpty(form.walletId)) errors.walletId = t('validation.walletRequired');
  if (!isValidDate(form.date)) errors.date = t('validation.dateInvalid');
  else if (new Date(form.date) > new Date(new Date().setHours(23, 59, 59, 999))) errors.date = t('validation.dateFuture');
  if (note && !maxLength(note, 200)) errors.note = t('validation.noteMax');
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateCategory(form, existingNames, t) {
  const errors = {};
  const name = trimValue(form.name);
  if (!isNonEmpty(name)) errors.name = t('validation.categoryNameRequired');
  else if (!maxLength(name, 40)) errors.name = t('validation.categoryNameMax');
  else if (existingNames.some((n) => n.toLowerCase() === name.toLowerCase())) errors.name = t('validation.categoryExists');
  if (!form.type || !['income', 'expense'].includes(form.type)) errors.type = t('validation.categoryTypeRequired');
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateWallet(form, existingNames, t) {
  const errors = {};
  const name = trimValue(form.name);
  if (!isNonEmpty(name)) errors.name = t('validation.walletNameRequired');
  else if (!maxLength(name, 40)) errors.name = t('validation.walletNameMax');
  else if (existingNames.some((n) => n.toLowerCase() === name.toLowerCase())) errors.name = t('validation.walletExists');
  if (form.balance === '' || form.balance === null || Number.isNaN(Number(form.balance))) errors.balance = t('validation.balanceInvalid');
  return { valid: Object.keys(errors).length === 0, errors };
}
