import * as DateFns from "date-fns";
import type { Freshness } from "../transit-api-client/cache.ts";

interface FreshnessProps {
  state: Freshness;
  /** Seconds since the cached response was fetched. */
  ageSeconds: number | null;
}

/**
 * Small inline indicator for data freshness.
 *
 * - fresh: nothing rendered (data is current).
 * - stale: muted "updated HH:MM" timestamp.
 * - unavailable: muted "temporarily unavailable" notice.
 */
export function FreshnessNote({ state, ageSeconds }: FreshnessProps) {
  if (state === "fresh") return null;

  if (state === "unavailable") {
    return (
      <span className="freshness unavailable">⚠ temporarily unavailable</span>
    );
  }

  // stale
  const updatedAt = ageSeconds !== null
    ? DateFns.format(
      new Date(Date.now() - ageSeconds * 1000),
      "HH:mm",
    )
    : "?";

  return <span className="freshness stale">updated {updatedAt}</span>;
}
