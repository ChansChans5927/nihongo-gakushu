import { describe, it, expect } from "vitest";
import { getTheme, THEME_CONFIGS } from "./theme";

describe("Theme System (getTheme)", () => {
  it("should return the default theme when 'default' is requested", () => {
    const theme = getTheme("default");
    expect(theme).toBeDefined();
    expect(theme.key).toBe("default");
    expect(theme.isDefault).toBe(true);
    expect(theme.isSamurai).toBe(false);
  });

  it("should return the samurai theme when 'samurai' is requested", () => {
    const theme = getTheme("samurai");
    expect(theme).toBeDefined();
    expect(theme.key).toBe("samurai");
    expect(theme.isSamurai).toBe(true);
    expect(theme.isDefault).toBe(false);
  });

  it("should return the default theme as fallback for invalid theme keys", () => {
    const theme = getTheme("non-existent-theme");
    expect(theme).toBeDefined();
    expect(theme.key).toBe("default");
    expect(theme.isDefault).toBe(true);
  });

  it("should contain newly refactored properties in all theme configurations", () => {
    const themes = ["default", "samurai", "yokai", "zen"];
    themes.forEach((themeKey) => {
      const theme = THEME_CONFIGS[themeKey];
      expect(theme).toBeDefined();
      expect(theme.radicalsBoxBg).toBeDefined();
      expect(typeof theme.radicalsBoxBg).toBe("string");
      expect(theme.progressBarBg).toBeDefined();
      expect(theme.btnSecondary).toBeDefined();
    });
  });
});
