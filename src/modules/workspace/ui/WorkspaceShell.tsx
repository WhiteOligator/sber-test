import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { useEffect, useMemo } from "react";
import { Outlet, matchPath, useLocation, useNavigate } from "react-router-dom";
import { CommandPalette } from "@/app/command-palette/CommandPalette";
import { useAppTheme } from "@/app/theme/AppThemeProvider";
import {
  useGetTicketsQuery,
  useMarkTicketReviewedMutation,
} from "@/modules/tickets/api/ticketsApi";
import { getTicketByIdMap } from "@/modules/tickets/model/ticket.selectors";
import { buildWorkspaceCommands } from "../commands/workspaceCommands";
import { rememberRecentTicketId } from "../state/recentTicketStorage";

const getTicketIdFromPathname = (pathname: string) =>
  matchPath("/tickets/:ticketId", pathname)?.params.ticketId ?? null;

export function WorkspaceShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: tickets = [] } = useGetTicketsQuery();
  const [markReviewed] = useMarkTicketReviewedMutation();
  const { mode: themeMode, toggleMode: toggleThemeMode } = useAppTheme();

  const currentTicketId = getTicketIdFromPathname(location.pathname);
  const ticketsById = useMemo(() => getTicketByIdMap(tickets), [tickets]);
  const currentTicket = currentTicketId
    ? ticketsById.get(currentTicketId) ?? null
    : null;

  useEffect(() => {
    if (currentTicket) {
      rememberRecentTicketId(currentTicket.id);
    }
  }, [currentTicket]);

  const commands = useMemo(
    () =>
      buildWorkspaceCommands({
        currentTicket,
        onOpenTicketList: () => navigate("/tickets"),
        onMarkTicketReviewed: (ticketId) => {
          void markReviewed(ticketId);
        },
        themeMode,
        onToggleTheme: toggleThemeMode,
      }),
    [currentTicket, markReviewed, navigate, themeMode, toggleThemeMode],
  );

  return (
    <CommandPalette commands={commands}>
      {({ openPalette }) => (
        <Box
          component="main"
          tabIndex={-1}
          sx={{ minHeight: "100vh", py: 3 }}
          aria-label="operator workspace"
        >
          <Container maxWidth="md">
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                display: "flex",
                gap: 2,
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box>
                <Typography variant="h6">Operator Workspace Sandbox</Typography>
                <Typography variant="body2" color="text.secondary">
                  Press Ctrl/⌘ K to open command palette
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Current ticket: {currentTicket?.id ?? "none"}
                </Typography>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={openPalette}
                >
                  Command palette
                </Button>
              </Box>
            </Paper>
            <Outlet />
          </Container>
        </Box>
      )}
    </CommandPalette>
  );
}
