import {
  useState,
  useEffect,
  useActionState,
  type SetStateAction,
  type Dispatch,
} from "react";

export function useResetableActionState<
  State extends PropstoFormState<unknown>,
  Payload,
>(
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  initialState: Awaited<State>,
  permalink?: string,
): [
  result: State | undefined,
  dispatch: (payload: Payload) => void,
  isPending: boolean,
  progress: number,
  setResultState: Dispatch<SetStateAction<State | undefined>>,
] {
  const [result, theAction, isPending] = useActionState(
    action,
    initialState,
    permalink,
  );
  const [resultState, setResultState] = useState<State | undefined>(undefined);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    setResultState(result); // Update resultState to the latest result
    setProgress(0);

    let interval: NodeJS.Timeout;
    if (result !== initialState && !result?.button) {
      interval = setInterval(() => {
        setProgress(currProgress => {
          if (currProgress >= 5) {
            setResultState(initialState);
            clearInterval(interval);
            return 0;
          }
          return currProgress + 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(interval);
    };
  }, [result, result?.message, initialState]);

  return [resultState, theAction, isPending, progress, setResultState];
}
