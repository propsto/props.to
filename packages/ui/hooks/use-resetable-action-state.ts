import { useState, useEffect, useActionState } from "react";

export function useResetableActionState<
  State extends PropstoFormState<unknown>,
  Payload,
>(
  action: (state: Awaited<State>, payload: Payload) => State | Promise<State>,
  initialState: Awaited<State>,
  resetDelay = 5000, // default reset delay in milliseconds
  permalink?: string
): [
  result: State | undefined,
  dispatch: (payload: Payload) => void,
  isPending: boolean,
] {
  const [result, theAction, isPending] = useActionState(
    action,
    initialState,
    permalink
  );
  const [resultState, setResultState] = useState<State | undefined>(undefined);

  useEffect(() => {
    setResultState(result); // Update resultState to the latest result

    let timeout: NodeJS.Timeout;
    if (result !== initialState) {
      timeout = setTimeout(() => {
        setResultState(initialState);
      }, resetDelay);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [result, result?.message, initialState, resetDelay]);

  return [resultState, theAction, isPending];
}
