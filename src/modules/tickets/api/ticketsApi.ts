import { baseApi } from "@/shared/api/baseApi";
import { mapTicketDtoToTicket } from "../model/ticket.mappers";
import type { Ticket, TicketDto } from "../model/ticket.types";
import { mockTicketDtos } from "./mockTickets";

let ticketDtos: TicketDto[] = [...mockTicketDtos];

export const ticketsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query<Ticket[], void>({
      queryFn: async () => ({ data: ticketDtos.map(mapTicketDtoToTicket) }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((ticket) => ({
                type: "Ticket" as const,
                id: ticket.id,
              })),
              { type: "Ticket" as const, id: "LIST" },
            ]
          : [{ type: "Ticket" as const, id: "LIST" }],
    }),
    getTicket: builder.query<Ticket | undefined, string>({
      queryFn: async (ticketId) => ({
        data: ticketDtos
          .map(mapTicketDtoToTicket)
          .find((ticket) => ticket.id === ticketId),
      }),
      providesTags: (_result, _error, ticketId) => [
        { type: "Ticket" as const, id: ticketId },
      ],
    }),
    markTicketReviewed: builder.mutation<Ticket | undefined, string>({
      queryFn: async (ticketId) => {
        ticketDtos = ticketDtos.map((ticket) =>
          ticket.id === ticketId ? { ...ticket, status: "reviewed" } : ticket,
        );

        return {
          data: ticketDtos
            .map(mapTicketDtoToTicket)
            .find((ticket) => ticket.id === ticketId),
        };
      },
      invalidatesTags: (_result, _error, ticketId) => [
        { type: "Ticket" as const, id: ticketId },
        { type: "Ticket" as const, id: "LIST" },
      ],
    }),
    markTicketInProgress: builder.mutation<Ticket | undefined, string>({
      queryFn: async (ticketId) => {
        ticketDtos = ticketDtos.map((ticket) =>
          ticket.id === ticketId
            ? { ...ticket, status: "in-progress" }
            : ticket,
        );

        return {
          data: ticketDtos
            .map(mapTicketDtoToTicket)
            .find((ticket) => ticket.id === ticketId),
        };
      },
      invalidatesTags: (_result, _error, ticketId) => [
        { type: "Ticket" as const, id: ticketId },
        { type: "Ticket" as const, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetTicketQuery,
  useGetTicketsQuery,
  useMarkTicketInProgressMutation,
  useMarkTicketReviewedMutation,
} = ticketsApi;

export const resetMockTicketsForTests = () => {
  ticketDtos = [...mockTicketDtos];
};
