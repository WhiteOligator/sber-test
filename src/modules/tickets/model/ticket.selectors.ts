import type { Ticket } from "./ticket.types";

export const getTicketByIdMap = (tickets: readonly Ticket[]) =>
  new Map(tickets.map((ticket) => [ticket.id, ticket]));
