import {
  getBrowserStorage,
  type KeyValueStorage,
} from "@/shared/browser/safeStorage";

export const RECENT_TICKETS_STORAGE_KEY = "ticket-workspace:recent-ticket-ids";
export const RECENT_TICKETS_LIMIT = 3;

export const readRecentTicketIds = (
  storage: KeyValueStorage | null = getBrowserStorage(),
): string[] => {

  if (!storage) return [];

  let rawValue: string | null;
  try {
    rawValue = storage.getItem(RECENT_TICKETS_STORAGE_KEY);
  } catch {
    return []; 
  }

  if (!rawValue) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawValue);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((id): id is string => typeof id === "string" && id.length > 0)
    .slice(0, RECENT_TICKETS_LIMIT);
};

export const rememberRecentTicketId = (
  ticketId: string,
  storage: KeyValueStorage | null = getBrowserStorage(),
) => {

  if (!storage || !ticketId) return;

  const recentIds = readRecentTicketIds(storage);
  const nextIds = [
    ticketId,
    ...recentIds.filter((recentId) => recentId !== ticketId),
  ].slice(0, RECENT_TICKETS_LIMIT);

  try {
    storage.setItem(RECENT_TICKETS_STORAGE_KEY, JSON.stringify(nextIds));
  } catch (error) { // privet mode OR extra memory error
    console.warn("Failed to persist recent ticket ids", error);
  }
};
