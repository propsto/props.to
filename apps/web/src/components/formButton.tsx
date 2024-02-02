"use client";

import { useFormStatus } from "react-dom";

export default function FormButton({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      className="btn text-zinc-100 bg-zinc-900 hover:bg-zinc-800 w-full shadow disabled:opacity-50"
      aria-disabled={pending}
    >
      {pending ? "Submitting..." : children}
    </button>
  );
}
