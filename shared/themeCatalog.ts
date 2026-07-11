export const THEME_PRICES = {
  samurai: 800,
  yokai: 1000,
  zen: 1200,
  chalkboard: 1500,
} as const;

export const THEME_IDS = [
  "default",
  "samurai",
  "yokai",
  "zen",
  "chalkboard",
  "golden_sakura",
  "golden_aura",
] as const;

export type PurchasableTheme = keyof typeof THEME_PRICES;
export type ThemeId = (typeof THEME_IDS)[number];

export function getThemePrice(theme: unknown): number | null {
  if (
    typeof theme !== "string" ||
    !Object.prototype.hasOwnProperty.call(THEME_PRICES, theme)
  ) {
    return null;
  }

  return THEME_PRICES[theme as PurchasableTheme];
}

export function isThemeId(theme: unknown): theme is ThemeId {
  return typeof theme === "string" && (THEME_IDS as readonly string[]).includes(theme);
}
