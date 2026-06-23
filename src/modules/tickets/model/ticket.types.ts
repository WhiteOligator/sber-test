export type TicketStatus = "new" | "in-progress" | "reviewed";

export type TicketDto = {
  id: string;
  title: string;
  requester: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high";
  updatedAt: string;
  description: string;
};

export type Ticket = {
  id: string;
  title: string;
  requesterName: string;
  status: TicketStatus;
  priority: "low" | "medium" | "high";
  updatedAt: string;
  description: string;
};
