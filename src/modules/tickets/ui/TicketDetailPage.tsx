import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useGetTicketQuery,
  useMarkTicketInProgressMutation,
} from "../api/ticketsApi";

export function TicketDetailPage() {
  const { ticketId = "" } = useParams();
  const { data: ticket, isLoading } = useGetTicketQuery(ticketId);
  const [markTicketInProgress, { isLoading: isMarkingInProgress }] =
    useMarkTicketInProgressMutation();
  const [draftsByTicketId, setDraftsByTicketId] = useState<
    Record<string, string>
  >({});

  const draft = draftsByTicketId[ticketId] ?? "";
  const updatedAtLabel = useMemo(
    () => (ticket ? new Date(ticket.updatedAt).toLocaleString() : ""),
    [ticket],
  );

  if (isLoading) return <Typography>Loading ticket</Typography>;

  if (!ticket) {
    return (
      <Alert severity="warning">
        Ticket {ticketId} was not found. <Link to="/tickets">Back to queue</Link>
      </Alert>
    );
  }

  return (
    <Box>
      <Button component={Link} to="/tickets" variant="text" sx={{ mb: 2 }}>
        Back to queue
      </Button>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Typography variant="h5" component="h1">
              {ticket.id} · {ticket.title}
            </Typography>
            <Chip label={ticket.status} size="small" />
            <Chip label={ticket.priority} size="small" variant="outlined" />
          </Box>
          <Typography color="text.secondary">
            {ticket.requesterName} · updated {updatedAtLabel}
          </Typography>
          <Typography>{ticket.description}</Typography>
          <TextField
            label="Operator draft"
            value={draft}
            onChange={(event) =>
              setDraftsByTicketId((current) => ({
                ...current,
                [ticketId]: event.target.value,
              }))
            }
            multiline
            minRows={4}
            helperText="This demonstrates per-ticket UI state inside the ticket workflow."
          />
          {ticket.status !== "in-progress" ? (
            <Box>
              <Button
                type="button"
                variant="contained"
                onClick={() => {
                  void markTicketInProgress(ticket.id);
                }}
                disabled={isMarkingInProgress}
              >
                In Progress
              </Button>
            </Box>
          ) : null}
        </Stack>
      </Paper>
    </Box>
  );
}
