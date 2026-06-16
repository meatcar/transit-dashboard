import { type Signal, useSignal, useSignalEffect } from "@preact/signals";
import type { JSX } from "preact/jsx-runtime";

type child = JSX.Element | string | null;
type ToggleProps =
  & {
    children: child | child[];
  }
  & (
    | { show: Signal<boolean>; hide?: never }
    | { show?: never; hide: Signal<boolean> }
  );
export default function Toggle(props: ToggleProps) {
  const { children } = props;

  // Always call hooks unconditionally; only wire the effect when in "hide" mode.
  const internalToggle = useSignal(
    typeof props.hide !== "undefined" ? !props.hide.value : false,
  );
  useSignalEffect(() => {
    if (typeof props.hide !== "undefined") {
      props.hide.value = !internalToggle.value;
    }
  });

  const toggle: Signal<boolean> = typeof props.show !== "undefined"
    ? props.show
    : internalToggle;

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
