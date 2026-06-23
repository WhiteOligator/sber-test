import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navigate, RouterProvider, createMemoryRouter } from "react-router-dom";
import { renderWithProviders } from "@/shared/testing/renderWithProviders";
import { AppThemeProvider } from "@/app/theme/AppThemeProvider";
import { resetMockTicketsForTests } from "@/modules/tickets/api/ticketsApi";
import { TicketDetailPage } from "@/modules/tickets/ui/TicketDetailPage";
import { TicketListPage } from "@/modules/tickets/ui/TicketListPage";
import { WorkspaceShell } from "./WorkspaceShell";

// Mirror of the real route tree.
const routes = [
  {
    path: "/",
    element: <WorkspaceShell />,
    children: [
      { index: true, element: <Navigate to="/tickets" replace /> },
      { path: "tickets", element: <TicketListPage /> },
      { path: "tickets/:ticketId", element: <TicketDetailPage /> },
    ],
  },
];

// Always start on the list — the test then navigates by clicking a real row,
// so it never assumes a specific ticket id exists in the data.
const renderApp = () => {
  const router = createMemoryRouter(routes, { initialEntries: ["/tickets"] });
  return renderWithProviders(
    <AppThemeProvider>
      <RouterProvider router={router} />
    </AppThemeProvider>,
  );
};

// The Ctrl/Cmd+K listener lives on window, so dispatch the event there.
const openCommandPalette = () =>
  fireEvent.keyDown(window, { key: "k", ctrlKey: true });

beforeEach(() => {
  resetMockTicketsForTests();
  window.localStorage.clear();
});

describe("command palette · ticket commands", () => {
  it("marks the opened ticket as reviewed via keyboard + palette", async () => {
    const user = userEvent.setup();
    renderApp();

    // Open the first ticket from the queue (no hard-coded id).
    const rows = await screen.findAllByTestId("ticket-list-item");
    await user.click(rows[0]);

    // Ticket detail rendered, and it is not reviewed yet.
    const status = await screen.findByTestId("ticket-status");
    expect(status).not.toHaveTextContent("reviewed");

    // Open palette from the keyboard and run the command.
    openCommandPalette();
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByTestId("command-mark-current-ticket-reviewed"),
    );

    // Status flips to "reviewed" after the mutation + cache invalidation.
    await waitFor(() => {
      expect(screen.getByTestId("ticket-status")).toHaveTextContent("reviewed");
    });
  });

  it("hides ticket-scoped commands when not on a ticket page", async () => {
    renderApp();
    await screen.findAllByTestId("ticket-list-item");

    openCommandPalette();
    const dialog = await screen.findByRole("dialog");

    expect(
      within(dialog).queryByTestId("command-mark-current-ticket-reviewed"),
    ).toBeNull();
    expect(within(dialog).queryByTestId("command-open-ticket-list")).toBeNull();
  });
});
