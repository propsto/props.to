export function PasswordResetTokenEmail(resetLink: string): JSX.Element {
  return (
    <p>
      Click <a href={resetLink}>here</a> to reset password.
    </p>
  );
}
