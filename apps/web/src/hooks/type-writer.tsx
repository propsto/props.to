import { useEffect, useRef, useState } from "react";

export const useTypeWriter = (
  words: string[],
  { wait = 3000, speed = 150 } = {},
): string => {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    const handleTyping = (): void => {
      const current = wordIndex % words.length;
      const fullTxt = words[current];

      let updatedText = text;
      if (isDeleting) {
        updatedText = fullTxt.substring(0, text.length - 1);
      } else {
        updatedText = fullTxt.substring(0, text.length + 1);
      }

      setText(updatedText);

      if (!isDeleting && text === fullTxt) {
        intervalRef.current && clearInterval(intervalRef.current);
        setTimeout(() => {
          setIsDeleting(true);
        }, wait);
      } else if (isDeleting && text === "") {
        intervalRef.current && clearInterval(intervalRef.current);
        setIsDeleting(false);
        setWordIndex(prevIndex => (prevIndex + 1) % words.length);
      }
    };

    intervalRef.current = setInterval(
      handleTyping,
      isDeleting ? speed / 2 : speed,
    );

    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, [text, isDeleting, wordIndex, words, wait, speed]);

  return text;
};
