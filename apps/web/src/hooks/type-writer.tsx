import { useEffect, useRef, useState } from "react";

export const useTypeWriter = (
  words: string[],
  { wait = 3000, speed = 150 } = {},
): string => {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>(null);
  const cursorRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const handleTyping = (): void => {
      const current = wordIndex % words.length;
      const fullTxt = words[current];

      const updatedText = isDeleting
        ? fullTxt.substring(0, text.length - 1)
        : fullTxt.substring(0, text.length + 1);

      setText(updatedText);

      if (!isDeleting && updatedText === fullTxt) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setTimeout(() => {
          setIsDeleting(true);
        }, wait);
      } else if (isDeleting && updatedText === "") {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        setIsDeleting(false);
        setWordIndex(i => (i + 1) % words.length);
      }
    };

    intervalRef.current = setInterval(
      handleTyping,
      isDeleting ? speed / 2 : speed,
    );

    cursorRef.current = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (cursorRef.current) {
        clearInterval(cursorRef.current);
      }
    };
  }, [text, isDeleting, wordIndex, words, wait, speed]);

  return showCursor ? `${text}|` : text + " ";
};
