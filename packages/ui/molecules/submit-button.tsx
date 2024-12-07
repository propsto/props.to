import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { ButtonProgress } from "../atoms";

export interface SubmitButtonProps extends React.PropsWithChildren {
  isPending: boolean;
  name?: string;
  value?: string;
  result?: { success?: boolean; message?: string; button?: string };
  progress?: number;
  disabled?: boolean;
}

export function SubmitButton({
  isPending,
  children,
  name,
  result,
  value,
  progress,
  disabled,
}: Readonly<SubmitButtonProps>): React.ReactElement {
  return (
    <ButtonProgress
      aria-disabled={isPending}
      disabled={disabled}
      name={name}
      progress={result?.success !== undefined ? progress : undefined}
      type="submit"
      value={value}
    >
      {isPending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
      {result?.success === true ? (
        <CheckCircle2 className="mr-2 size-4" />
      ) : null}
      {result?.success === false && result.message ? (
        <XCircle className="mr-2 size-4" />
      ) : null}
      {result?.message ?? result?.button ?? children}
    </ButtonProgress>
  );
}
