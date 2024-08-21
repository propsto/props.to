export {};

declare global {
  type PropstoFormState<T> =
    | {
        errors?: SchemaToErrors<T>;
        message?: string;
        success?: boolean;
        values?: T;
      }
    | undefined;

  type SchemaToErrors<T> = {
    [K in keyof T]?: string[] | undefined;
  };
}
