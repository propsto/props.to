"use client";

import { z } from "zod";
import { Input } from "@propsto/ui/atoms";
import { useFormContext } from "react-hook-form";
import { type Step } from "@stepperize/react";

const accountSchema = z.object({
  username: z.string().min(6, "User name is required"),
  cardNumber: z.string().min(16, "Card number is required"),
  expirationDate: z.string().min(5, "Expiration date is required"),
  cvv: z.string().min(3, "CVV is required"),
});

export type AccountFormValues = z.infer<typeof accountSchema>;

export function StepComponent(): React.ReactElement {
  const {
    register,
    formState: { errors },
  } = useFormContext<AccountFormValues>();

  return (
    <div className="space-y-4 text-start">
      <div className="space-y-2">
        <label
          htmlFor={register("username").name}
          className="block text-sm font-medium text-primary"
        >
          Username
        </label>
        <Input
          id={register("username").name}
          className="block w-full p-2 border rounded-md"
        />
        {errors.username ? (
          <span className="text-sm text-destructive">
            {errors.username.message}
          </span>
        ) : null}
      </div>
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

export const config: Step = {
  id: "account",
  label: "Account",
  schema: accountSchema,
};

export const defaults = (): AccountFormValues => ({
  username: "",
  cardNumber: "",
  expirationDate: "",
  cvv: "",
});
