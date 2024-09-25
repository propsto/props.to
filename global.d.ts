export {};

declare global {
  type PropstoFormState<T> =
    | {
        errors?: SchemaToErrors<T>; // Managed by zod error list
        message?: string; // Temporary message to show briefly
        success?: boolean; // Whether the state is considered success or not
        code?: string; // Internal code to use when additional actions must be taken
        button?: string; // New value for button label when a button is in scope
      }
    | undefined;

  type SchemaToErrors<T> = {
    [K in keyof T]?: string[] | undefined;
  };

  type HandleSuccessEvent<T> = {
    success: true;
    data: T;
    error: null;
  };

  type HandleErrorEvent = {
    success: false;
    data: null;
    error: string;
  };

  type HandleEvent<T> = HandleSuccessEvent<T> | HandleErrorEvent;
}
