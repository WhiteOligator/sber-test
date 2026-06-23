import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithProviders } from "@/shared/testing/renderWithProviders";
import { RECENT_TICKETS_STORAGE_KEY } from "@/modules/workspace/state/recentTicketStorage";
import { TicketListPage } from "./TicketListPage";

const seedRecent = (ids: string[]) =>
  window.localStorage.setItem(RECENT_TICKETS_STORAGE_KEY, JSON.stringify(ids));

const renderList = () =>
  renderWithProviders(
    <MemoryRouter>
      <TicketListPage />
    </MemoryRouter>,
  );

beforeEach(() => window.localStorage.clear());
afterEach(() => window.localStorage.clear());

describe("TicketListPage · recently opened", () => {
  it("shows recent tickets freshest-first and hides ids missing from the API", async () => {
    // TCK-9999 does not exist in the API response → must be skipped.
    seedRecent(["TCK-1003", "TCK-1001", "TCK-9999"]);
    renderList();

    const items = await screen.findAllByTestId("recent-ticket-item");

    expect(items).toHaveLength(2); // stale id filtered out
    expect(items[0]).toHaveTextContent("TCK-1003"); // freshest first
    expect(items[1]).toHaveTextContent("TCK-1001");
  });

  it("shows at most the 3 freshest tickets", async () => {
    seedRecent(["TCK-1001", "TCK-1002", "TCK-1003", "TCK-1004"]);
    renderList();

    const items = await screen.findAllByTestId("recent-ticket-item");

    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("TCK-1001");
    expect(items[1]).toHaveTextContent("TCK-1002");
    expect(items[2]).toHaveTextContent("TCK-1003");
  });

  it("renders an empty state when there are no recent tickets", async () => {
    // Wait for the queue to load before asserting the empty recent block.
    renderList();
    await screen.findAllByTestId("ticket-list-item");

    expect(screen.queryAllByTestId("recent-ticket-item")).toHaveLength(0);
    expect(
      screen.getByText("No recently opened tickets yet."),
    ).toBeInTheDocument();
  });

  it("links each recent ticket to its detail route", async () => {
    seedRecent(["TCK-1001"]);
    renderList();

    const [item] = await screen.findAllByTestId("recent-ticket-item");
    expect(item).toHaveAttribute("href", "/tickets/TCK-1001");
  });
});
