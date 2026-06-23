import type { Ticket, TicketDto } from "./ticket.types";

export const mapTicketDtoToTicket = (dto: TicketDto): Ticket => ({
  id: dto.id,
  title: dto.title,
  requesterName: dto.requester,
  status: dto.status,
  priority: dto.priority,
  updatedAt: dto.updatedAt,
  description: dto.description,
});
