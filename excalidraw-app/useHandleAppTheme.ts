import { THEME } from "@excalidraw/excalidraw";
import { useEffect, useLayoutEffect, useState } from "react";

import type { Theme } from "@excalidraw/element/types";

import { STORAGE_KEYS } from "./app_constants";

const getDarkThemeMediaQuery = (): MediaQueryList | undefined =>
  window.matchMedia?.("(prefers-color-scheme: dark)");

export const getStoredAppTheme = (): Theme | "system" => {
  const stored = localStorage.getItem(STORAGE_KEYS.LOCAL_STORAGE_THEME);

  if (stored === THEME.LIGHT || stored === THEME.DARK || stored === "system") {
    return stored;
  }

  return "system";
};

export const resolveEditorTheme = (appTheme: Theme | "system"): Theme => {
  if (appTheme === "system") {
    return getDarkThemeMediaQuery()?.matches ? THEME.DARK : THEME.LIGHT;
  }

  return appTheme;
};

export const useHandleAppTheme = () => {
  const [appTheme, setAppTheme] = useState<Theme | "system">(getStoredAppTheme);
  const [editorTheme, setEditorTheme] = useState<Theme>(() =>
    resolveEditorTheme(appTheme),
  );

  useEffect(() => {
    const mediaQuery = getDarkThemeMediaQuery();

    const handleChange = (e: MediaQueryListEvent) => {
      setEditorTheme(e.matches ? THEME.DARK : THEME.LIGHT);
    };

    if (appTheme === "system") {
      mediaQuery?.addEventListener("change", handleChange);
    }

    return () => {
      mediaQuery?.removeEventListener("change", handleChange);
    };
  }, [appTheme]);

  useLayoutEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_THEME, appTheme);
    setEditorTheme(resolveEditorTheme(appTheme));
  }, [appTheme]);

  return { editorTheme, appTheme, setAppTheme };
};
