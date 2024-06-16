"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { Button } from "../atoms/button";

export function SubmitButton({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  const { pending } = useFormStatus();
  return (
    <Button aria-disabled={pending} type="submit">
      {pending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </Button>
  );
}
