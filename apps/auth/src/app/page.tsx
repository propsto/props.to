import { buttonVariants } from "@propsto/ui/atoms/button";
import { cn } from "@propsto/ui/utils/cn";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1 className="text-4xl">Welcome!</h1>
      <div className="flex gap-4 justify-center">
        <Link className={cn(buttonVariants())} href="/signin">
          Sign-in
        </Link>
        <Link
          className={cn(buttonVariants({ variant: "outline" }))}
          href="/signup"
        >
          Sign-up
        </Link>
      </div>
    </>
  );
}
