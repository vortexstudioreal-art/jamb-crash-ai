/**
 * Races a promise against a timeout so dead networks (signal on, no data)
 * can't hang the UI forever. On timeout the caller falls through to its
 * offline/cached path.
 */
export const withTimeout = <T,>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timed out after ${ms}ms: ${label}`)), ms);
  });
  return Promise.race([Promise.resolve(promise), timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
};
