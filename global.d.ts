export {};

declare global {
  type PropstoFormState<T> =
    | {
        errors?: SchemaToErrors<T>; // Managed by zod error list
        message?: string; // Temporary message to show briefly
        success?: boolean; // Whether the state is considered success or not
        code?: string; // Internal code to use when additional actions must be taken
        button?: string; // New value for button label when a button is in scope
        values?: T; // Values to restore if necessary
      }
    | undefined;

  type SchemaToErrors<T> = {
    [K in keyof T]?: string[] | undefined;
  };

  type HandleSuccessEvent<T> = {
    success: true;
    data: T;
    error?: undefined;
  };

  type HandleErrorEvent<T = unknown> = {
    success: false;
    data?: undefined;
    error?: string;
    fieldErrors?: SchemaToErrors<T>;
  };

  type HandleEvent<T, E = unknown> =
    | HandleSuccessEvent<T>
    | HandleErrorEvent<E>;
}
