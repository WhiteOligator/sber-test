import { createTheme } from "@mui/material/styles";

export type AppThemeMode = "light" | "dark";

export const createAppTheme = (mode: AppThemeMode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: mode === "dark" ? "#7fb5c8" : "#315f72" },
      secondary: { main: mode === "dark" ? "#d2a27f" : "#7a4f3b" },
      background:
        mode === "dark"
          ? { default: "#11161a", paper: "#182126" }
          : { default: "#f5f6f7", paper: "#ffffff" },
    },
    shape: { borderRadius: 8 },
  });

export const theme = createAppTheme("light");
