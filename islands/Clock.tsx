import { useSignal, useSignalEffect } from "@preact/signals";
import { getHours, getMilliseconds, getMinutes, getSeconds } from "date-fns";
import { IS_BROWSER } from "fresh/runtime";

export default function Clock() {
  const now = Date.now();

  const h = useSignal(0);
  const m = useSignal(0);

  const tick = () => {
    h.value = getHours(Date.now());
    m.value = getMinutes(Date.now());
  };

  const oneMinute = 60 * 1000;
  const nextMinute = oneMinute -
    (getSeconds(now) * 1000 + getMilliseconds(now));

  // schedule a tick each minute, starting aligned to the next minute boundary
  useSignalEffect(() => {
    if (!IS_BROWSER) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      interval = setInterval(tick, oneMinute);
    }, nextMinute);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  });

  function pad(n: number) {
    return n < 10 ? `0${n}` : n;
  }

  tick();
  return (
    <span className="clock">
      <span className="hours">{pad(h.value)}</span>
      {":"}
      <span className="minutes">{pad(m.value)}</span>
    </span>
  );
}
