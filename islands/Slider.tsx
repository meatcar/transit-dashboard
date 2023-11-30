import { JSX } from "preact";
import { signal } from "@preact/signals";

export default function Slider(props: JSX.HTMLAttributes<HTMLInputElement>) {
  const v = signal(props.value as number);
  return (
    <>
      <label for={props.name}>{props.name} {v}</label>
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
