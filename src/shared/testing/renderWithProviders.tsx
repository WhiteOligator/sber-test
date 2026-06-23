import { CssBaseline, ThemeProvider } from "@mui/material";
import { configureStore } from "@reduxjs/toolkit";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import { Provider } from "react-redux";
import { baseApi } from "@/shared/api/baseApi";
import { theme } from "@/theme";

export const makeTestStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });

export const renderWithProviders = (
  ui: ReactElement,
  options?: RenderOptions,
) => {
  const store = makeTestStore();

  return render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {ui}
      </ThemeProvider>
    </Provider>,
    options,
  );
};
