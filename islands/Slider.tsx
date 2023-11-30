import { JSX } from "preact";
import { useSignal } from "@preact/signals";

export default function Slider(props: JSX.HTMLAttributes<HTMLInputElement>) {
  const v = useSignal(props.value as number);
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
