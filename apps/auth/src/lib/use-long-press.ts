import { useRef } from "react";

export function useLongPress({
  onLongPress,
  onClick,
}: {
  onLongPress: () => void;
  onClick?: () => void;
}): {
  longPressHandlers: {
    onMouseDown: () => void;
    onMouseUp: () => void;
    onTouchStart: () => void;
    onTouchEnd: () => void;
    onClick: () => void;
  };
} {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const isLongPress = useRef<boolean>();

  function startPressTimer(): void {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
    }, 500);
  }

  function handleOnClick(): void {
    if (isLongPress.current) return;
    onClick?.();
  }

  function handleOnMouseDown(): void {
    startPressTimer();
  }

  function handleOnMouseUp(): void {
    clearTimeout(timerRef.current);
  }

  function handleOnTouchStart(): void {
    startPressTimer();
  }

  function handleOnTouchEnd(): void {
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
