export type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const getBrowserStorage = (): KeyValueStorage | null => {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
};
