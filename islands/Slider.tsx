import { JSX } from "preact";
import { type Signal, useSignal } from "@preact/signals";

export default function Slider(props: JSX.HTMLAttributes<HTMLInputElement>) {
  const v: Signal<number> = useSignal(props.value ?? 0);
  return (
    <>
      <label for={props.name}>{props.name} {v.value}</label>
      <br />
      <input
        type="range"
        {...props}
        value={v}
        onChange={(e) => v.value = parseInt(e.currentTarget.value, 10)}
        style="width: 100%"
      />
    </>
  );
}
