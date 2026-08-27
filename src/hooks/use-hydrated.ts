import { useEffect, useState } from "react";

/**
 * True only after the client has hydrated. Use to gate time/locale/random
 * dependent rendering so SSR markup and first client render match.
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
