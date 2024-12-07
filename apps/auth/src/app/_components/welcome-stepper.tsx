"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useController, useForm, useFormContext } from "react-hook-form";
import { z } from "zod";
import { defineStepper } from "@stepperize/react";
import { Button, Input, Label, Separator } from "@propsto/ui/atoms";
import { Form } from "@propsto/ui/molecules";
import { constCommon } from "@propsto/constants/common";
import { redirect } from "next/navigation";
import { generatePreview } from "@propsto/ui/utils/preview";
import Image from "next/image";
import { type User } from "next-auth";
import {
  accountHandler,
  personalHandler,
} from "@/server/welcome-stepper-action";

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
  image: (typeof window === "undefined" ? z.any() : z.instanceof(FileList))
    .refine((files: File[] | undefined) => {
      return files?.length === 1;
    }, "Image is required.")
    .refine(
      (files: File[] | undefined) =>
        files?.[0] && files[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 5MB.`,
    )
    .refine(
      (files: File[] | undefined) =>
        files?.[0] && ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted.",
    ),
});

const accountSchema = z.object({
  cardNumber: z.string().min(16, "Card number is required"),
  expirationDate: z.string().min(5, "Expiration date is required"),
  cvv: z.string().min(3, "CVV is required"),
});

export type PersonalFormValues = z.infer<typeof personalSchema>;
export type AccountFormValues = z.infer<typeof accountSchema>;

const { useStepper, steps } = defineStepper(
  { id: "personal", label: "Personal", schema: personalSchema },
  { id: "account", label: "Account", schema: accountSchema },
  { id: "complete", label: "Complete", schema: z.object({}) },
);

const stepComponents = {
  personal: () => <PersonalComponent />,
  account: () => <AccountComponent />,
  complete: () => <CompleteComponent />,
};

export function WelcomeStepper({
  user,
}: Readonly<{
  user: Required<Omit<User, "name">>;
}>): React.ReactElement {
  const stepper = useStepper();
  const form = useForm<PersonalFormValues>({
    resolver: zodResolver(stepper.current.schema),
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      dateOfBirth: user.dateOfBirth?.toISOString().substring(0, 10),
      email: user.email ?? "",
      image: user.image,
    },
  });

  const onSubmit = async (
    values: z.infer<typeof stepper.current.schema>,
  ): Promise<void> => {
    if (stepper.current.id === "personal") {
      const result = await personalHandler(
        values as z.infer<typeof stepper.current.schema>,
        user.id,
      );
      if (result.success) {
        stepper.next();
      }
    }
    if (stepper.current.id === "account") {
      await accountHandler(values as z.infer<typeof stepper.current.schema>);
    }
    if (stepper.current.id === "complete") {
      redirect(constCommon.PROPSTO_APP_URL);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={event => void form.handleSubmit(onSubmit)(event)}
        className="space-y-6 p-6 border rounded-lg lg:w-3/4 w-96"
      >
        <div className="flex">
          <div className="flex flex-col">
            <h2 className="text-lg font-medium">Welcome!</h2>
            <p>Lets setup your account to start sending and receiving props.</p>
          </div>
        </div>
        <nav aria-label="Account setup steps" className="group my-4">
          <ol className="flex items-center justify-between gap-2">
            {stepper.all.map((step, index, array) => (
              <React.Fragment key={step.id}>
                <li className="flex items-center gap-4 flex-shrink-0">
                  <Button
                    type="button"
                    role="tab"
                    variant={
                      index <= stepper.current.index ? "default" : "secondary"
                    }
                    aria-current={
                      stepper.current.id === step.id ? "step" : undefined
                    }
                    aria-posinset={index + 1}
                    aria-setsize={steps.length}
                    aria-selected={stepper.current.id === step.id}
                    className="flex size-10 items-center justify-center rounded-full"
                    onClick={() => {
                      stepper.goTo(step.id);
                    }}
                  >
                    {index + 1}
                  </Button>
                  <span className="text-sm font-medium">{step.label}</span>
                </li>
                {index < array.length - 1 && (
                  <Separator
                    className={`flex-1 ${
                      index < stepper.current.index ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </ol>
        </nav>
        <div className="space-y-4">
          {stepper.switch(stepComponents)}
          {!stepper.isLast ? (
            <div className="flex justify-end gap-4">
              <Button
                variant="secondary"
                onClick={stepper.prev}
                disabled={stepper.isFirst}
              >
                Back
              </Button>
              <Button type="submit">Next</Button>
            </div>
          ) : (
            <Button onClick={stepper.reset}>Reset</Button>
          )}
        </div>
      </form>
    </Form>
  );
}

function PersonalComponent(): React.ReactElement {
  const {
    register,
    formState: { errors },
  } = useFormContext<PersonalFormValues>();
  const { field: imageField } = useController({ name: "image" });
  const imageValue = imageField.value as string | null;
  const [preview, setPreview] = React.useState<string | ArrayBuffer | null>(
    imageValue ?? null,
  );

  const handleChange = React.useCallback(
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

function AccountComponent(): React.ReactElement {
  const {
    register,
    formState: { errors },
  } = useFormContext<AccountFormValues>();

  return (
    <div className="space-y-4 text-start">
      <div className="space-y-2">
        <label
          htmlFor={register("cardNumber").name}
          className="block text-sm font-medium text-primary"
        >
          Card Number
        </label>
        <Input
          id={register("cardNumber").name}
          {...register("cardNumber")}
          className="block w-full p-2 border rounded-md"
        />
        {errors.cardNumber ? (
          <span className="text-sm text-destructive">
            {errors.cardNumber.message}
          </span>
        ) : null}
      </div>
      <div className="space-y-2">
        <label
          htmlFor={register("expirationDate").name}
          className="block text-sm font-medium text-primary"
        >
          Expiration Date
        </label>
        <Input
          id={register("expirationDate").name}
          {...register("expirationDate")}
          className="block w-full p-2 border rounded-md"
        />
        {errors.expirationDate ? (
          <span className="text-sm text-destructive">
            {errors.expirationDate.message}
          </span>
        ) : null}
      </div>
      <div className="space-y-2">
        <label
          htmlFor={register("cvv").name}
          className="block text-sm font-medium text-primary"
        >
          CVV
        </label>
        <Input
          id={register("cvv").name}
          {...register("cvv")}
          className="block w-full p-2 border rounded-md"
        />
        {errors.cvv ? (
          <span className="text-sm text-destructive">{errors.cvv.message}</span>
        ) : null}
      </div>
    </div>
  );
}

function CompleteComponent(): React.ReactElement {
  return <div className="text-center">Thank you! Your order is complete.</div>;
}
