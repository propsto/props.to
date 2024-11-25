"use server";

import { logger } from "@propsto/logger?web";
import {
  type RequestEarlyAccessFormType,
  RequestEarlyAccessFormSchema,
} from "./types";

export async function requestEarlyAccess(
  prevState: PropstoFormState<RequestEarlyAccessFormType>,
  formData: FormData,
): Promise<PropstoFormState<RequestEarlyAccessFormType>> {
  const comingData = Object.fromEntries(
    formData.entries(),
  ) as RequestEarlyAccessFormType;
  logger("requestEarlyAccess submit %O", comingData);
  // Parse the form data against expected schema
  const { success, error, data } =
    RequestEarlyAccessFormSchema.safeParse(comingData);
  if (!success) {
    logger("signUpAction %O %O", error.flatten().fieldErrors);
    return {
      errors: error.flatten().fieldErrors,
      success: false,
      values: data,
    };
  }
  formData.set(
    "xnQsjsdp",
    "5205582e0022d842036f9e00dd829d2759c77e1712eb531d8cd132bc9dd1d5a0",
  );
  formData.set("zc_gad", "");
  formData.set(
    "xmIwtLD",
    "83d980870da6bef654a33c1ba4b767eb4ef63d64f7112614f01cd1f05f8e64de12a55a73d48e636f790f19756bf64c93",
  );
  formData.set("actionType", "TGVhZHM=");
  formData.set("returnURL", "null");

  const response = await fetch(`https://crm.zoho.com/crm/WebToLeadForm`, {
    method: "POST",
    body: formData,
  });
  if (response.status === 200) {
    return { message: "Success!", success: true };
  }
  return {
    message: "There was an error.",
    success: false,
    values: data,
  };
}
