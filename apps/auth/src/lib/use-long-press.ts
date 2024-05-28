import { useRef } from "react";

export default function useLongPress({
  onLongPress,
  onClick,
}: {
  onLongPress: () => void;
  onClick?: () => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const isLongPress = useRef<boolean>();

  function startPressTimer() {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
    }, 500);
  }

  function handleOnClick() {
    if (isLongPress.current) return;
    onClick?.();
  }

  function handleOnMouseDown() {
    startPressTimer();
  }

  function handleOnMouseUp() {
    clearTimeout(timerRef.current);
  }

  function handleOnTouchStart() {
    startPressTimer();
  }

  function handleOnTouchEnd() {
    if (isLongPress.current) return;
    clearTimeout(timerRef.current);
  }

  return {
    longPressHandlers: {
      onMouseDown: handleOnMouseDown,
      onMouseUp: handleOnMouseUp,
      onTouchStart: handleOnTouchStart,
      onTouchEnd: handleOnTouchEnd,
      onClick: handleOnClick,
    },
  };
}
