import { type Signal, useSignal, useSignalEffect } from "@preact/signals";
import type { JSX } from "preact/jsx-runtime";

type child = JSX.Element | string | null;
type ToggleProps =
  & {
    children: child | child[];
    control?: boolean;
  }
  & (
    | { show: Signal<boolean>; hide?: never }
    | { show?: never; hide: Signal<boolean> }
  );
export default function Toggle(props: ToggleProps) {
  const { children, control } = props;
  let toggle: Signal<boolean>;
  if (typeof props.show !== "undefined") toggle = props.show;
  else {
    toggle = useSignal(!props.hide.value);
    useSignalEffect(() => {
      props.hide.value = !toggle.value;
    });
  }

  const onClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("toggle-control")) {
      toggle.value = !toggle.value;
    }
  };

  return (
    <span
      class="toggle"
      onClick={onClick}
      data-toggle={toggle}
      data-show={toggle.value}
    >
      {children}
    </span>
  );
}
