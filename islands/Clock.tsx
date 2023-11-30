import { type Signal, useSignal, useSignalEffect } from "@preact/signals";
import { getHours, getMilliseconds, getMinutes, getSeconds } from "date-fns";
import { IS_BROWSER } from "$fresh/runtime.ts";

export default function Clock() {
  const now = Date.now();

  const h = useSignal(0);
  const m = useSignal(0);

  const tick = () => {
    h.value = getHours(Date.now());
    m.value = getMinutes(Date.now());
  };

  // next minute schedule update every minute.
  if (IS_BROWSER) {
    const oneMinute = 60 * 1000;
    const nextMinute = oneMinute -
      (getSeconds(now) * 1000 + getMilliseconds(now));

    useSignalEffect(() => {
      let interval: number;
      setTimeout(() => {
        interval = setInterval(tick, oneMinute);
      }, nextMinute);
      return () => interval && clearInterval(interval);
    });
  }

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
