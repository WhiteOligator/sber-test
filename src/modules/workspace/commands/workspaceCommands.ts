import type { CommandDefinition } from "@/app/command-palette/commandPalette.types";
import type { AppThemeMode } from "@/theme";
import type { Ticket } from "@/modules/tickets/model/ticket.types";

export type BuildWorkspaceCommandsParams = {
  currentTicket: Ticket | null;
  onOpenTicketList: () => void;
  onMarkTicketReviewed: (ticketId: string) => void;
  themeMode: AppThemeMode;
  onToggleTheme: () => void;
};

export const buildWorkspaceCommands = ({
  currentTicket,
  themeMode,
  onToggleTheme,
  onOpenTicketList,
  onMarkTicketReviewed,
}: BuildWorkspaceCommandsParams): CommandDefinition[] => {
  
  const commands: CommandDefinition[] = [
    {
      id: "toggle-theme",
      title:
        themeMode === "dark" ? "Switch to light theme" : "Switch to dark theme",
      description:
        themeMode === "dark"
          ? "Use the light workspace theme."
          : "Use the dark workspace theme.",
      scope: "global",
      run: onToggleTheme,
    },
    // Candidate task:
    // - add "Open ticket list" for the ticket page
    // - add "Mark current ticket as reviewed" for the current ticket
    // Keep this feature logic outside the generic command palette runtime.
  ];

  if (!currentTicket) return commands;

  commands.push(
    {
      id: "open-ticket-list",
      title: "Open ticket list",
      description: "Go to the ticket queue.",
      scope: "ticket",
      run: onOpenTicketList,
    },
    {
      id: "mark-current-ticket-reviewed",
      title: "Mark current ticket as reviewed",
      description: "Changes the task status to \"reviewed\".",
      scope: "ticket",
      disabled: currentTicket.status === "reviewed",
      run: () => onMarkTicketReviewed(currentTicket.id),
    },
  )

  return commands;
};
