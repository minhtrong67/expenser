// `key` is an i18n key: default names are translated into the user's language
// at the moment their account is first seeded.
export const DEFAULT_EXPENSE_CATEGORIES = [
  { key: 'defaults.cat.food', emoji: '🍔', color: '#F97316' },
  { key: 'defaults.cat.transport', emoji: '🚗', color: '#3B82F6' },
  { key: 'defaults.cat.shopping', emoji: '🛍️', color: '#EC4899' },
  { key: 'defaults.cat.entertainment', emoji: '🎮', color: '#8B5CF6' },
  { key: 'defaults.cat.education', emoji: '📚', color: '#06B6D4' },
  { key: 'defaults.cat.bills', emoji: '🧾', color: '#EF4444' },
  { key: 'defaults.cat.health', emoji: '❤️‍🩹', color: '#10B981' },
  { key: 'defaults.cat.housing', emoji: '🏠', color: '#F59E0B' },
  { key: 'defaults.cat.other', emoji: '📦', color: '#64748B' },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { key: 'defaults.cat.salary', emoji: '💰', color: '#10B981' },
  { key: 'defaults.cat.bonus', emoji: '🎁', color: '#F59E0B' },
  { key: 'defaults.cat.freelance', emoji: '💻', color: '#3B82F6' },
  { key: 'defaults.cat.investment', emoji: '📈', color: '#8B5CF6' },
  { key: 'defaults.cat.gift', emoji: '🎀', color: '#EC4899' },
  { key: 'defaults.cat.other', emoji: '📦', color: '#64748B' },
];

export const DEFAULT_WALLETS = [
  { key: 'defaults.wallet.cash', icon: 'payments', color: '#10B981', balance: 0 },
  { key: 'defaults.wallet.bank', icon: 'account_balance', color: '#3B82F6', balance: 0 },
  { key: 'defaults.wallet.ewallet', icon: 'qr_code_2', color: '#8B5CF6', balance: 0 },
];

export const WALLET_ICONS = [
  'payments', 'account_balance', 'qr_code_2', 'credit_card', 'savings',
  'account_balance_wallet', 'currency_exchange', 'diamond', 'smartphone', 'attach_money',
  'account_box', 'real_estate_agent', 'trending_up', 'card_giftcard', 'business_center',
];

export const CATEGORY_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#10B981',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#EC4899',
  '#64748B',
];
