export function PasswordResetTokenEmail(resetLink: string): React.ReactElement {
  return (
    <p>
      Click <a href={resetLink}>here</a> to reset password.
    </p>
  );
}
