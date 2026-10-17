import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@propsto/ui/atoms/button";

/** `?page=` from search params; anything missing, non-numeric or below 1 is page 1. */
export function parsePage(raw: string | undefined): number {
  const page = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function Pager({
  basePath,
  currentPage,
  totalPages,
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
}): React.ReactNode {
  if (totalPages <= 1) return null;
  const link = (page: number, children: React.ReactNode): React.ReactNode =>
    page >= 1 && page <= totalPages ? (
      <Button variant="outline" size="sm" asChild>
        <Link href={`${basePath}?page=${page}`}>{children}</Link>
      </Button>
    ) : (
      <Button variant="outline" size="sm" disabled>
        {children}
      </Button>
    );

  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-2">
        {link(
          currentPage - 1,
          <>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </>,
        )}
        {link(
          currentPage + 1,
          <>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </>,
        )}
      </div>
    </div>
  );
}
