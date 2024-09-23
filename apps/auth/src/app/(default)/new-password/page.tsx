import { redirect } from "next/navigation";
import { z } from "zod";
import { validPasswordResetToken } from "@propsto/data/utils/password-reset-token";
import { ErrorCodes } from "@propsto/constants/src/other";
import { NewPasswordForm } from "@components/new-password-form";

const newPasswordParamsSchema = z.object({
  token: z.string(),
});

export default async function NewPasswordPage({
  searchParams,
}: Readonly<{
  searchParams: Record<string, string>;
}>): Promise<JSX.Element> {
  const { token } = newPasswordParamsSchema.parse(searchParams);
  if (!token) redirect(`/error?code=${ErrorCodes.InvalidNewPassordToken}`);

  const tokenValid = await validPasswordResetToken(token);
  if (!tokenValid) redirect(`/error?code=${ErrorCodes.InvalidNewPassordToken}`);

  return (
    <div className="mx-auto text-center flex flex-col justify-center space-y-4 w-80 h-full">
      <div className="flex flex-col space-y-2 text-center">
        <h1>New password</h1>
        <p className="text-sm text-muted-foreground">
          Please enter a new password twice.
        </p>
        <NewPasswordForm token={token} />
      </div>
    </div>
  );
}
