import {
  getBrowserStorage,
  type KeyValueStorage,
} from "@/shared/browser/safeStorage";

export const RECENT_TICKETS_STORAGE_KEY = "ticket-workspace:recent-ticket-ids";
export const RECENT_TICKETS_LIMIT = 3;

export const readRecentTicketIds = (
  storage: KeyValueStorage | null = getBrowserStorage(),
): string[] => {
  // Candidate task: make this robust against invalid JSON, non-array values,
  // empty ids, unavailable storage, and stale ids at the call site.
  const rawValue = storage?.getItem(RECENT_TICKETS_STORAGE_KEY);
  return rawValue ? JSON.parse(rawValue) : [];
};

export const rememberRecentTicketId = (
  ticketId: string,
  storage: KeyValueStorage | null = getBrowserStorage(),
) => {
  const recentIds = readRecentTicketIds(storage);
  const nextIds = [
    ticketId,
    ...recentIds.filter((recentId) => recentId !== ticketId),
  ].slice(0, RECENT_TICKETS_LIMIT);

  storage?.setItem(RECENT_TICKETS_STORAGE_KEY, JSON.stringify(nextIds));
};
