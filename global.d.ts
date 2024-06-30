export {};

declare global {
  type PropstoFormState<T> =
    | {
        errors?: SchemaToErrors<T>;
        message?: string;
        success?: boolean;
      }
    | undefined;

  type SchemaToErrors<T> = {
    [K in keyof T]?: string[] | undefined;
  };
}
