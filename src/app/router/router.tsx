import { Navigate, createBrowserRouter } from "react-router-dom";
import { TicketDetailPage } from "@/modules/tickets/ui/TicketDetailPage";
import { TicketListPage } from "@/modules/tickets/ui/TicketListPage";
import { WorkspaceShell } from "@/modules/workspace/ui/WorkspaceShell";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <WorkspaceShell />,
    children: [
      { index: true, element: <Navigate to="/tickets" replace /> },
      { path: "tickets", element: <TicketListPage /> },
      { path: "tickets/:ticketId", element: <TicketDetailPage /> },
    ],
  },
]);
