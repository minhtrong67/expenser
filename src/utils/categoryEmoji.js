// Curated emoji picks shown in the category emoji picker, grouped by theme
// (labelKey is an i18n key) while users stay free to type/paste any emoji.
export const EMOJI_GROUPS = [
  {
    labelKey: 'emoji.food',
    emojis: ['🍔', '🍕', '🍜', '🍣', '🍱', '🍰', '☕', '🧋', '🍺', '🍎', '🥗', '🍳'],
  },
  {
    labelKey: 'emoji.transport',
    emojis: ['🚗', '🚕', '🚌', '🚆', '✈️', '🛵', '🚲', '⛽', '🅿️', '🚢', '🚀', '🚦'],
  },
  {
    labelKey: 'emoji.shopping',
    emojis: ['🛍️', '🛒', '👗', '👟', '💄', '💍', '🎁', '🏬', '👜', '⌚', '🕶️', '🧴'],
  },
  {
    labelKey: 'emoji.entertainment',
    emojis: ['🎮', '🎬', '🎵', '⚽', '🏀', '🎉', '🎲', '📸', '🎨', '🎳', '🎤', '🧩'],
  },
  {
    labelKey: 'emoji.work',
    emojis: ['📚', '✏️', '💻', '🎓', '🔬', '🧮', '🖨️', '📝', '💼', '📈', '🧑‍💻', '📎'],
  },
  {
    labelKey: 'emoji.utilities',
    emojis: ['🧾', '💡', '💧', '📶', '📱', '📺', '🔌', '🧺', '🛢️', '📡', '🔋', '🧯'],
  },
  {
    labelKey: 'emoji.health',
    emojis: ['❤️‍🩹', '🏥', '💪', '🧘', '💊', '🧠', '🩺', '💉', '👓', '🦷', '🧴', '🏃'],
  },
  {
    labelKey: 'emoji.home',
    emojis: ['🏠', '🏢', '🧒', '🐶', '🪑', '🌳', '🧹', '🔧', '👶', '👨‍👩‍👧', '🛏️', '🐱'],
  },
  {
    labelKey: 'emoji.finance',
    emojis: ['💰', '🏦', '📈', '💵', '🎁', '💱', '💳', '🎀', '🏡', '🤝', '📊', '🪙'],
  },
  {
    labelKey: 'emoji.other',
    emojis: ['🏷️', '📦', '🚩', '⚓', '🌐', '❓', '⭐', '🔥', '✨', '🧊', '🎯', '🗂️'],
  },
];

export const DEFAULT_CATEGORY_EMOJI = '🏷️';

// Best-effort mapping from the old Material Symbols icon names to an emoji,
// so categories created before the emoji picker still show something
// sensible instead of breaking.
const LEGACY_ICON_TO_EMOJI = {
  restaurant: '🍔', local_cafe: '☕', lunch_dining: '🍱', bakery_dining: '🥐', icecream: '🍦',
  local_bar: '🍺', ramen_dining: '🍜', set_meal: '🍣', nutrition: '🥗', liquor: '🍷',
  directions_car: '🚗', directions_bus: '🚌', two_wheeler: '🛵', flight: '✈️', train: '🚆',
  local_taxi: '🚕', local_gas_station: '⛽', pedal_bike: '🚲', electric_car: '🔋', directions_boat: '🚢',
  shopping_bag: '🛍️', shopping_cart: '🛒', checkroom: '👗', diamond: '💎', redeem: '🎁',
  storefront: '🏬', local_mall: '🏬', watch: '⌚', style: '💄', dry_cleaning: '🧺',
  sports_esports: '🎮', movie: '🎬', music_note: '🎵', sports_soccer: '⚽', sports_basketball: '🏀',
  celebration: '🎉', casino: '🎲', photo_camera: '📸', palette: '🎨', toys: '🧸',
  school: '🎓', menu_book: '📚', laptop_mac: '💻', work: '💼', edit_note: '📝',
  science: '🔬', calculate: '🧮', language: '🌐', draw: '✏️', print: '🖨️',
  receipt_long: '🧾', bolt: '💡', water_drop: '💧', wifi: '📶', phone_iphone: '📱',
  subscriptions: '📺', tv: '📺', router: '📡', local_laundry_service: '🧺', propane_tank: '🛢️',
  health_and_safety: '❤️‍🩹', local_hospital: '🏥', fitness_center: '💪', spa: '🧘', medication: '💊',
  psychology: '🧠', self_improvement: '🧘', vaccines: '💉', visibility: '👓', ecg_heart: '🩺',
  home: '🏠', apartment: '🏢', child_care: '👶', pets: '🐶', chair: '🪑',
  yard: '🌳', cleaning_services: '🧹', home_repair_service: '🔧', crib: '👶', family_restroom: '👨‍👩‍👧',
  payments: '💰', account_balance: '🏦', trending_up: '📈', savings: '💵', volunteer_activism: '🎀',
  currency_exchange: '💱', attach_money: '💵', card_giftcard: '🎁', real_estate_agent: '🏡', handshake: '🤝',
  category: '🏷️', more_horiz: '📦', flag: '🚩', anchor: '⚓', public: '🌐',
  account_balance_wallet: '👛', qr_code_2: '📱', credit_card: '💳',
};

/** Resolves the emoji to display for a category, falling back gracefully
 * for categories created before the emoji picker existed. */
export function getCategoryEmoji(category) {
  if (!category) return DEFAULT_CATEGORY_EMOJI;
  if (category.emoji) return category.emoji;
  if (category.icon && LEGACY_ICON_TO_EMOJI[category.icon]) return LEGACY_ICON_TO_EMOJI[category.icon];
  return DEFAULT_CATEGORY_EMOJI;
}
