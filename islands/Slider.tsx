import { JSX } from "preact";
import { useSignal } from "@preact/signals";

interface SliderProps extends JSX.HTMLAttributes<HTMLInputElement> {
  unit: string;
}

export default function Slider(props: SliderProps) {
  const v = useSignal(props.value as number);
  return (
    <>
      <label for={props.name}>
        {props.label} <em>{v}</em> {props.unit}
      </label>
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
