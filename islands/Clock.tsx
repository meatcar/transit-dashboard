import { type Signal, useSignal } from "@preact/signals";
import { getHours, getMilliseconds, getMinutes, getSeconds } from "date-fns";
export default function Clock() {
  const now = Date.now();

  const h: Signal<number> = useSignal(getHours(now));
  const m: Signal<number> = useSignal(getMinutes(now));

  const nextMinute = (1000 - getMilliseconds(now)) +
    (60 - getSeconds(now)) * 1000;

  setTimeout(() => {
    setInterval(() => {
      h.value = getHours(Date.now());
      m.value = getMinutes(Date.now());
    }, 60 * 1000);
  }, nextMinute);

  function prefixZero(n: number) {
    return n < 10 ? `0${n}` : n;
  }

  return (
    <span className="clock">
      <span className="hours">
        {prefixZero(h.value)}
      </span>
      {":"}
      <span className="minutes">
        {prefixZero(m.value)}
      </span>
    </span>
  );
}
