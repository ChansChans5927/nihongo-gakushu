import { describe, expect, it } from "vitest";
import { getThemePrice, isThemeId, THEME_PRICES } from "./themeCatalog.ts";

describe("theme catalog", () => {
  it("keeps purchasable theme prices on the server-owned catalog", () => {
    expect(getThemePrice("samurai")).toBe(800);
    expect(getThemePrice("yokai")).toBe(1000);
    expect(getThemePrice("zen")).toBe(1200);
    expect(getThemePrice("chalkboard")).toBe(1500);
  });

  it("does not allow clients to purchase reward or unknown themes", () => {
    expect(getThemePrice("default")).toBeNull();
    expect(getThemePrice("golden_sakura")).toBeNull();
    expect(getThemePrice("made_up_theme")).toBeNull();
  });

  it("recognizes every theme that can be equipped", () => {
    expect(isThemeId("default")).toBe(true);
    expect(isThemeId("golden_aura")).toBe(true);
    expect(isThemeId("made_up_theme")).toBe(false);
    expect(Object.values(THEME_PRICES).every((price) => price > 0)).toBe(true);
  });
});
