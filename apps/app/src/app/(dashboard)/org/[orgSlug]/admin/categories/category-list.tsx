"use client";

import { useState } from "react";
import { Button } from "@propsto/ui/atoms/button";
import { Badge } from "@propsto/ui/atoms/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@propsto/ui/atoms/dialog";
import { Trash2, Tag } from "lucide-react";
import { deleteCategoryAction } from "./actions";
import { EditCategoryDialog } from "./edit-category-dialog";

type Category = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  organizationId: string | null;
};

interface CategoryListProps {
  categories: Category[];
  orgSlug: string;
  editable?: boolean;
}

export function CategoryList({
  categories,
  orgSlug,
  editable = false,
}: CategoryListProps): React.ReactNode {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    
    setDeletingId(confirmDelete.id);
    setError(null);
    try {
      const result = await deleteCategoryAction(orgSlug, confirmDelete.id);
      if (result.success) {
        setConfirmDelete(null);
      } else {
        setError(result.error ?? "Failed to delete category");
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="divide-y">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: category.color
                    ? `${category.color}20`
                    : "hsl(var(--muted))",
                  color: category.color ?? "hsl(var(--muted-foreground))",
                }}
              >
                <Tag className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{category.name}</span>
                  {category.color && (
                    <div
                      className="h-3 w-3 rounded-full border"
                      style={{ backgroundColor: category.color }}
                      title={category.color}
                    />
                  )}
                </div>
                {category.description && (
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            {editable && (
              <div className="flex items-center gap-2">
                <EditCategoryDialog category={category} orgSlug={orgSlug} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmDelete(category)}
                  disabled={deletingId === category.id}
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )}

            {!editable && (
              <Badge variant="outline" className="text-xs">
                System
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{confirmDelete?.name}&quot;?
              Templates using this category will no longer be categorized.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              disabled={!!deletingId}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleDelete()}
              disabled={!!deletingId}
            >
              {deletingId ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
