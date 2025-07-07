"use client";

import { z } from "zod";
import React, { useCallback, useState, useEffect } from "react";
import { generatePreview } from "@propsto/ui/lib/preview";
import Image from "next/image";
import { useController, useFormContext } from "react-hook-form";
import { Input, Label } from "@propsto/ui/atoms";
import { type User } from "next-auth";
import { type Step } from "@stepperize/react";

const personalSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().email(),
  dateOfBirth: z.string().optional(),
  image: z.any().optional(), // Simplified for now to avoid validation issues
});

export type PersonalFormValues = z.infer<typeof personalSchema>;

export function StepComponent(): React.ReactElement {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<PersonalFormValues>();
  const { field: imageField } = useController<PersonalFormValues, "image">({ name: "image" });
  const imageValue = imageField.value as string | null;
  const [preview, setPreview] = useState<string | ArrayBuffer | null>(
    imageValue ?? null,
  );

  // Watch for changes in the image field to update preview
  const watchedImage = watch("image");
  
  useEffect(() => {
    if (typeof watchedImage === "string" && watchedImage) {
      setPreview(watchedImage);
    } else if (!watchedImage) {
      setPreview(null);
    }
  }, [watchedImage]);

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
        <Label
          htmlFor={register("dateOfBirth").name}
          className="block text-sm font-medium text-primary"
        >
          Date of birth
        </Label>
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
        <Label
          htmlFor={register("image").name}
          className="block text-sm font-medium text-primary"
        >
          Avatar (Optional)
        </Label>
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
            {errors.image?.message ? (
              <span className="text-sm text-destructive">
                {typeof errors.image.message === 'string' ? errors.image.message : 'Invalid image'}
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

export const defaults = (user: User): PersonalFormValues => ({
  firstName: user.firstName ?? "",
  lastName: user.lastName ?? "",
  dateOfBirth: user.dateOfBirth
    ? new Date(user.dateOfBirth).toISOString().substring(0, 10)
    : "",
  email: user.email ?? "",
  image: user.image ?? undefined,
});