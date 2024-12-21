"use client";

import { z } from "zod";
import React, { useCallback, useState } from "react";
import { generatePreview } from "@propsto/ui/utils/preview";
import Image from "next/image";
import { useController, useFormContext } from "react-hook-form";
import { Input, Label } from "@propsto/ui/atoms";
import { type User } from "next-auth";
import { type Step } from "@stepperize/react";

const MAX_FILE_SIZE = 2000000;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const personalSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().email(),
  dateOfBirth: z.string().date().nullish(),
  image: (typeof window === "undefined"
    ? z.any()
    : z.instanceof(FileList).or(z.string())
  )
    .refine((value: File[] | undefined) => {
      if (typeof value === "string") {
        return true;
      }
      return value?.length === 1;
    }, "Image is required.")
    .refine((value: File[] | undefined) => {
      if (typeof value === "string") {
        return true;
      }
      return value?.[0] && value[0]?.size <= MAX_FILE_SIZE;
    }, `Max file size is 5MB.`)
    .refine((value: File[] | undefined) => {
      if (typeof value === "string") {
        return true;
      }
      return value?.[0] && ACCEPTED_IMAGE_TYPES.includes(value[0]?.type);
    }, ".jpg, .jpeg, .png and .webp files are accepted."),
});

export type PersonalFormValues = z.infer<typeof personalSchema>;

export function StepComponent(): React.ReactElement {
  const {
    register,
    formState: { errors },
  } = useFormContext<PersonalFormValues>();
  const { field: imageField } = useController({ name: "image" });
  const imageValue = imageField.value as string | null;
  const [preview, setPreview] = useState<string | ArrayBuffer | null>(
    imageValue ?? null,
  );

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        generatePreview({
          file,
          onSuccess: base64Image => {
            setPreview(base64Image);
          },
        });
      }
    },
    [],
  );

  return (
    <div className="space-y-4 text-start">
      <div className="space-y-2">
        <Label
          htmlFor={register("firstName").name}
          className="block text-sm font-medium text-primary"
        >
          First name
        </Label>
        <Input
          id={register("firstName").name}
          {...register("firstName")}
          className="block w-full p-2 border rounded-md"
        />
        {errors.firstName ? (
          <span className="text-sm text-destructive">
            {errors.firstName.message}
          </span>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label
          htmlFor={register("lastName").name}
          className="block text-sm font-medium text-primary"
        >
          Last name
        </Label>
        <Input
          id={register("lastName").name}
          {...register("lastName")}
          className="block w-full p-2 border rounded-md"
        />
        {errors.lastName ? (
          <span className="text-sm text-destructive">
            {errors.lastName.message}
          </span>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label
          htmlFor={register("email").name}
          className="block text-sm font-medium text-primary"
        >
          Email
        </Label>
        <Input
          id={register("email").name}
          {...register("email")}
          disabled
          className="block w-full p-2 border rounded-md"
        />
        {errors.email ? (
          <span className="text-sm text-destructive">
            {errors.email.message}
          </span>
        ) : null}
      </div>
      <div className="space-y-2">
        <label
          htmlFor={register("dateOfBirth").name}
          className="block text-sm font-medium text-primary"
        >
          Date of birth
        </label>
        <Input
          id={register("dateOfBirth").name}
          {...register("dateOfBirth")}
          type="date"
          className="block w-full p-2 border rounded-md"
        />
        {errors.dateOfBirth ? (
          <span className="text-sm text-destructive">
            {errors.dateOfBirth.message}
          </span>
        ) : null}
      </div>
      <div className="space-y-2">
        <label
          htmlFor={register("image").name}
          className="block text-sm font-medium text-primary"
        >
          Avatar
        </label>
        <div className="flex flex-row space-x-5 items-center">
          <Image
            width="96"
            height="96"
            src={(preview as string | undefined) ?? "/avatar.png"}
            className="rounded-full size-24"
            alt="avatarPicture"
          />
          <div>
            <Input
              id={register("image").name}
              {...register("image")}
              type="file"
              onChange={handleChange}
              className="block w-full p-2 border rounded-md"
            />
            {errors.image ? (
              <span className="text-sm text-destructive">
                {String(errors.image.message)}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export const config: Step = {
  id: "personal",
  label: "Personal",
  schema: personalSchema,
};

export const defaults = (
  user: Required<Omit<User, "name">>,
): PersonalFormValues => ({
  firstName: user.firstName ?? "",
  lastName: user.lastName ?? "",
  dateOfBirth: user.dateOfBirth?.toISOString().substring(0, 10),
  email: user.email ?? "",
  image: user.image,
});
