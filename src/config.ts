/**
 * Application Configuration
 *
 * All app-wide settings: year, locale, limits, labels, book detection, and chart colors.
 */

// =============================================================================
// APP SETTINGS
// =============================================================================

/** Locale for number/currency formatting */
export const LOCALE = 'en-US';

/** Currency code for formatting */
export const CURRENCY = 'USD';

/** Display limits for various UI elements */
export const LIMITS = {
  topItems: 5,
  topExpensive: 10,
  topBooks: 5,
  itemsPerPage: 20,
  truncateLength: 30,
  truncateLengthShort: 25,
};

/** Animation durations */
export const ANIMATIONS = {
  slideTransition: 0.4,
  chartAnimation: 750,
  numberAnimation: 1.5,
  staggerDelay: 0.1,
};

// =============================================================================
// LABELS
// =============================================================================

export const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const MONTHS_ABBREV = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export const DAYS_FULL = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];

export const DAYS_ABBREV = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const MESSAGES = {
  peakMonth: {
    holiday: 'Holiday shopping got you good',
    primeDay: 'Prime Day strikes again',
    default: 'You treated yourself well',
  },
};

// =============================================================================
// CHART COLORS
// =============================================================================

export const AMAZON_ORANGE = {
  full: 'rgba(255, 153, 0, 1)',
  selected: 'rgba(255, 153, 0, 1)',
  normal: 'rgba(255, 153, 0, 0.6)',
  hover: 'rgba(255, 153, 0, 0.8)',
  border: 'rgba(255, 153, 0, 0.5)',
};

export const BOOK_FORMAT_COLORS = {
  kindle: { base: 'rgba(59, 130, 246', hover: 'rgba(59, 130, 246, 1)' },
  audible: { base: 'rgba(251, 146, 60', hover: 'rgba(251, 146, 60, 1)' },
  physical: { base: 'rgba(34, 197, 94', hover: 'rgba(34, 197, 94, 1)' },
};

export const BOOK_FORMAT_STYLES = {
  kindle: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Kindle' },
  audible: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'Audible' },
  physical: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Physical' },
};

export const TOOLTIP_STYLE = {
  background: 'rgba(19, 25, 33, 0.95)',
  titleColor: '#fff',
  bodyColor: '#fff',
};

export const CHART_AXIS_COLORS = {
  grid: 'rgba(255, 255, 255, 0.1)',
  text: 'rgba(255, 255, 255, 0.6)',
  textLight: 'rgba(255, 255, 255, 0.8)',
};

// =============================================================================
// BOOK DETECTION
// =============================================================================

export const BOOK_PUBLISHERS = [
  'penguin', 'random house', 'hachette', 'harpercollins', 'simon & schuster',
  'macmillan', 'scholastic', 'audible', 'brilliance audio', 'blackstone',
  'recorded books', 'tantor', 'harlequin', 'kensington', 'sourcebooks',
  'tor', 'del rey', 'ace', 'orbit', 'berkley', 'dutton', 'putnam', 'viking',
  'bantam', 'doubleday', 'knopf', 'crown', 'ballantine', 'anchor', 'vintage',
  'little, brown', 'grand central', 'st. martin', 'minotaur', 'flatiron',
  'bloomsbury', 'wiley', "o'reilly", 'pearson', 'mcgraw-hill',
  'cambridge university press', 'oxford university press', 'mit press',
  'chronicle books', 'hay house', 'sounds true',
];

export const SUBSCRIPTION_EXCLUSIONS = [
  'membership', 'subscription', 'unlimited', 'prime', 'audible plus',
  'kindle unlimited', 'gold member', 'platinum member', 'trial', 'renewal',
  'monthly plan', 'annual plan',
];

export const PRODUCT_EXCLUSIONS = [
  'water bottle', 'bottle', 'tumbler', 'mug', 'cup',
  'phone case', 'cable', 'charger', 'adapter', 'battery', 'headphone',
  'speaker', 'keyboard', 'mouse', 'monitor', 'laptop', 'tablet case',
  'screen protector', 'stylus', 'holder', 'stand', 'mount', 'bracket',
  'shelf', 'organizer', 'storage', 'container', 'bag', 'backpack', 'wallet',
  'watch', 'clock', 'lamp', 'light', 'bulb', 'tool', 'screwdriver', 'wrench',
  'drill', 'tape', 'glue', 'paint', 'brush', 'cleaner', 'soap', 'shampoo',
  'lotion', 'cream', 'vitamin', 'supplement', 'protein', 'snack', 'food',
  'coffee', 'tea', 'rice', 'spices', 'spice', 'seasoning', 'flour', 'sugar',
  'salt', 'cooking', 'meals', 'lbs)', 'oz)', 'kg)', 'shirt', 't-shirt',
  'pants', 'shorts', 'dress', 'jacket', 'coat', 'shoes', 'socks', 'underwear',
  'toy', 'game', 'puzzle', 'lego', 'figure', 'doll', 'pet', 'dog', 'cat',
  'fish', 'bird', 'plant', 'seed', 'garden', 'furniture', 'mattress', 'pillow',
  'blanket', 'towel', 'curtain', 'rug', 'mat', 'simple modern',
];

export const STRONG_BOOK_INDICATORS = [
  'kindle edition', 'paperback', 'hardcover', 'hardback', 'audiobook',
  'audible', '(book', 'book)', 'novel', 'ebook', 'e-book', 'mass market',
  'library binding', 'board book', 'spiral-bound', 'leather bound',
];

export const MEDIUM_BOOK_INDICATORS = [
  'memoir', 'biography', 'autobiography', 'anthology', 'novella',
  'short stories', 'poetry', 'poems', 'textbook', 'workbook', 'handbook',
  'guide to', 'manual', 'cookbook', 'recipe book', '100 recipes',
  '101 recipes', 'recipes for',
];

export const BOOK_SERIES_PATTERN = /book\s*\d+/i;
export const BOOK_SERIES_PAREN_PATTERN = /\(.*book\s*\d+.*\)/i;
