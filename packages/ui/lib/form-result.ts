import {
  type FieldValues,
  type Path,
  type UseFormReturn,
} from "react-hook-form";

type FormLike<Values extends FieldValues> = Pick<
  UseFormReturn<Values>,
  "setError" | "clearErrors" | "setFocus"
>;

const formatMessage = (messages?: string[]): string | undefined => {
  if (!messages || messages.length === 0) return undefined;
  return messages.filter(Boolean).join(" ");
};

/**
 * Applies a server HandleEvent result to a react-hook-form instance.
 * Returns true when the result was successful, false otherwise.
 */
export function applyHandleEventToForm<Values extends FieldValues>(
  form: FormLike<Values>,
  result: HandleEvent<unknown, Values>,
  preferredFocusOrder?: Path<Values>[],
): boolean {
  if (result.success) {
    form.clearErrors();
    return true;
  }

  let focused = false;
  const fieldErrors = result.fieldErrors;

  if (fieldErrors) {
    for (const [field, messages] of Object.entries(fieldErrors)) {
      const message = formatMessage(messages);
      if (!message) continue;

      const path = field as Path<Values>;
      form.setError(path, { type: "server", message });
      if (!focused) {
        form.setFocus(path);
        focused = true;
      }
    }
  }

  // If no field errors were provided, apply the general error to the first preferred field
  const firstPreferredField = preferredFocusOrder?.[0];
  if (!focused && firstPreferredField && result.error) {
    form.setError(firstPreferredField, {
      type: "server",
      message: result.error,
    });
    form.setFocus(firstPreferredField);
    focused = true;
  }

  // Fall back to a root-level error if nothing else was set
  if (!focused && result.error) {
    form.setError("root" as Path<Values>, {
      type: "server",
      message: result.error,
    });
  }

  return false;
}

export type { FormLike };
