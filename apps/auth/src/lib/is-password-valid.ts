export function isPasswordValid(password: string): boolean;
export function isPasswordValid(
  password: string,
  breakdown: boolean,
  strict?: boolean,
): { caplow: boolean; num: boolean; min: boolean; admin_min: boolean };
export function isPasswordValid(
  password: string,
  breakdown?: boolean,
  strict?: boolean,
): boolean | Record<string, boolean> {
  let cap = false, // Has uppercase characters
    low = false, // Has lowercase characters
    num = false, // At least one number
    min = false, // Eight characters, or fifteen in strict mode.
    adminMin = false;
  if (password.length >= 8 && (!strict || password.length > 14)) min = true;
  if (strict && password.length > 14) adminMin = true;
  if (/\d/.exec(password)) num = true;
  if (/[a-z]/.exec(password)) low = true;
  if (/[A-Z]/.exec(password)) cap = true;

  if (!breakdown) return cap && low && num && min && (strict ? adminMin : true);

  let errors: Record<string, boolean> = { caplow: cap && low, num, min };
  // Only return the admin key if strict mode is enabled.
  if (strict) errors = { ...errors, adminMin };

  return errors;
}
