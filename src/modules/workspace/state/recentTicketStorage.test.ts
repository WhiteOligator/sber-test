import { afterEach, describe, expect, it, vi } from "vitest";
import {
  RECENT_TICKETS_LIMIT,
  RECENT_TICKETS_STORAGE_KEY,
  readRecentTicketIds,
  rememberRecentTicketId,
} from "./recentTicketStorage";

const createMemoryStorage = () => {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
};

// Storage that fails on every access — emulates Safari private mode / quota.
const createThrowingStorage = () => ({
  getItem: () => {
    throw new Error("storage blocked");
  },
  setItem: () => {
    throw new Error("quota exceeded");
  },
  removeItem: () => {
    throw new Error("storage blocked");
  },
});

// Pre-seed a memory storage with a raw value under the recent-tickets key.
const seedRawValue = (rawValue: string) => {
  const storage = createMemoryStorage();
  storage.setItem(RECENT_TICKETS_STORAGE_KEY, rawValue);
  return storage;
};

describe("rememberRecentTicketId", () => {
  it("keeps the latest 3 unique ticket ids", () => {
    const storage = createMemoryStorage();

    rememberRecentTicketId("TCK-1001", storage);
    rememberRecentTicketId("TCK-1002", storage);
    rememberRecentTicketId("TCK-1003", storage);
    rememberRecentTicketId("TCK-1004", storage);
    rememberRecentTicketId("TCK-1002", storage);

    expect(readRecentTicketIds(storage)).toEqual([
      "TCK-1002",
      "TCK-1004",
      "TCK-1003",
    ]);
  });

  it("moves a re-opened ticket to the front without duplicating it", () => {
    const storage = createMemoryStorage();

    rememberRecentTicketId("TCK-1001", storage);
    rememberRecentTicketId("TCK-1002", storage);
    rememberRecentTicketId("TCK-1001", storage);

    expect(readRecentTicketIds(storage)).toEqual(["TCK-1001", "TCK-1002"]);
  });

  it("ignores an empty ticket id", () => {
    const storage = createMemoryStorage();

    rememberRecentTicketId("", storage);

    expect(readRecentTicketIds(storage)).toEqual([]);
  });

  it("does nothing and does not throw when storage is unavailable", () => {
    expect(() => rememberRecentTicketId("TCK-1001", null)).not.toThrow();
  });

  it("swallows write errors (quota exceeded / private mode)", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const storage = createThrowingStorage();

    expect(() => rememberRecentTicketId("TCK-1001", storage)).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});

describe("readRecentTicketIds", () => {
  it("returns [] when storage is unavailable", () => {
    expect(readRecentTicketIds(null)).toEqual([]);
  });

  it("returns [] when the value is missing or empty", () => {
    expect(readRecentTicketIds(createMemoryStorage())).toEqual([]);
    expect(readRecentTicketIds(seedRawValue(""))).toEqual([]);
  });

  it("returns [] on corrupted JSON", () => {
    expect(readRecentTicketIds(seedRawValue("{ not json"))).toEqual([]);
  });

  it("returns [] when the stored value is not an array", () => {
    expect(readRecentTicketIds(seedRawValue('{"foo":1}'))).toEqual([]);
    expect(readRecentTicketIds(seedRawValue("5"))).toEqual([]);
  });

  it("keeps only non-empty string ids", () => {
    const storage = seedRawValue(
      JSON.stringify(["TCK-1001", "", null, 5, "TCK-1002"]),
    );

    expect(readRecentTicketIds(storage)).toEqual(["TCK-1001", "TCK-1002"]);
  });

  it("never returns more than the limit", () => {
    const storage = seedRawValue(JSON.stringify(["A", "B", "C", "D", "E"]));

    expect(readRecentTicketIds(storage)).toHaveLength(RECENT_TICKETS_LIMIT);
  });

  it("returns [] when getItem throws", () => {
    expect(readRecentTicketIds(createThrowingStorage())).toEqual([]);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
