import { describe, expect, it, vi } from "vitest";
import { filterCommands } from "./commandPalette.search";
import type { CommandDefinition } from "./commandPalette.types";

const commands: CommandDefinition[] = [
  {
    id: "open-ticket-list",
    title: "Open ticket list",
    description: "Go to the ticket queue.",
    scope: "ticket",
    run: vi.fn(),
  },
  {
    id: "mark-current-ticket-reviewed",
    title: "Mark current ticket as reviewed",
    description: "Complete triage for the active ticket.",
    scope: "ticket",
    run: vi.fn(),
  },
];

describe("filterCommands", () => {
  it("filters commands by title and description", () => {
    expect(filterCommands(commands, "reviewed")).toEqual([commands[1]]);
  });
});
