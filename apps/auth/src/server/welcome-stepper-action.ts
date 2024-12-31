"use server";

import { put } from "@vercel/blob";
import { updateUser } from "@propsto/data/repos";
import { type PersonalFormValues } from "@components/welcome-stepper/steps/personal-step";
import { type AccountFormValues } from "@components/welcome-stepper/steps/account-step";

export async function personalHandler(
  values: Omit<PersonalFormValues, "image"> & { image?: File[] | string },
  userId: string,
): Promise<HandleEvent<{ id: string }>> {
  const { image, dateOfBirth, ...rest } = values;
  let blob;
  if (image && typeof image !== "string") {
    // TODO abstract to saveAvatar to let others use another methodaway from Vercel
    blob = await put(`avatars/${userId}`, image[0], {
      access: "public",
      contentType: image[0].type,
    });
  }
  const userUpdated = await updateUser(
    userId,
    {
      ...rest,
      ...(dateOfBirth
        ? { dateOfBirth: new Date(dateOfBirth).toISOString() }
        : {}),
      ...(blob ? { image: blob.url } : {}),
    },
    { id: true },
  );
  return userUpdated;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-function-return-type -- temp
export async function accountHandler(values: AccountFormValues) {
  return Promise.resolve({ success: true });
}
