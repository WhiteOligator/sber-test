import { CssBaseline, ThemeProvider } from "@mui/material";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createAppTheme, type AppThemeMode } from "@/theme";
import { getBrowserStorage } from "@/shared/browser/safeStorage";

const THEME_STORAGE_KEY = "ticket-workspace-theme";

type AppThemeContextValue = {
  mode: AppThemeMode;
  setMode: (mode: AppThemeMode) => void;
  toggleMode: () => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

const readInitialMode = (): AppThemeMode => {
  const storedMode = getBrowserStorage()?.getItem(THEME_STORAGE_KEY);
  return storedMode === "dark" ? "dark" : "light";
};

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppThemeMode>(readInitialMode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const setMode = (nextMode: AppThemeMode) => {
    setModeState(nextMode);
    getBrowserStorage()?.setItem(THEME_STORAGE_KEY, nextMode);
  };

  const value = useMemo<AppThemeContextValue>(
    () => ({
      mode,
      setMode,
      toggleMode: () => setMode(mode === "dark" ? "light" : "dark"),
    }),
    [mode],
  );

  return (
    <AppThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppThemeContext.Provider>
  );
}

export const useAppTheme = () => {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider");
  }
  return context;
};
