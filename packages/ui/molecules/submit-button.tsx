import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { Button } from "../atoms";

export interface SubmitButtonProps {
  isPending: boolean;
  children: React.ReactNode;
  result: PropstoFormState<Record<string, string>>;
}

export function SubmitButton({
  isPending,
  children,
  result,
}: Readonly<SubmitButtonProps>): JSX.Element {
  return (
    <Button aria-disabled={isPending} type="submit">
      {isPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
      {result?.success === true ? (
        <CheckCircle2 className="mr-2 size-4" />
      ) : null}
      {result?.success === false && result.message ? (
        <XCircle className="mr-2 size-4" />
      ) : null}
      {result?.message ?? children}
    </Button>
  );
}
