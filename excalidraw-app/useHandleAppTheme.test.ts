import { THEME } from "@excalidraw/excalidraw";
import { vi } from "vitest";

import { STORAGE_KEYS } from "./app_constants";
import { getStoredAppTheme, resolveEditorTheme } from "./useHandleAppTheme";

const mockMatchMedia = (matches: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe("getStoredAppTheme", () => {
  beforeEach(() => {
    localStorage.removeItem(STORAGE_KEYS.LOCAL_STORAGE_THEME);
  });

  it("returns system when storage is null", () => {
    expect(getStoredAppTheme()).toBe("system");
  });

  it("returns system when storage is invalid", () => {
    localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_THEME, "garbage");
    expect(getStoredAppTheme()).toBe("system");
  });

  it.each([THEME.LIGHT, THEME.DARK, "system"] as const)(
    "returns stored %s unchanged",
    (theme) => {
      localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_THEME, theme);
      expect(getStoredAppTheme()).toBe(theme);
    },
  );
});

describe("resolveEditorTheme", () => {
  afterEach(() => {
    mockMatchMedia(false);
  });

  it("follows OS dark when appTheme is system", () => {
    mockMatchMedia(true);
    expect(resolveEditorTheme("system")).toBe(THEME.DARK);
  });

  it("follows OS light when appTheme is system", () => {
    mockMatchMedia(false);
    expect(resolveEditorTheme("system")).toBe(THEME.LIGHT);
  });

  it("ignores OS when appTheme is dark", () => {
    mockMatchMedia(false);
    expect(resolveEditorTheme(THEME.DARK)).toBe(THEME.DARK);
  });

  it("ignores OS when appTheme is light", () => {
    mockMatchMedia(true);
    expect(resolveEditorTheme(THEME.LIGHT)).toBe(THEME.LIGHT);
  });
});
