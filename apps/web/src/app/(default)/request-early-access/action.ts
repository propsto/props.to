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
    "5128a9641e517652964df40309b05c91468fb8ab1a3b02232ddea9b3a7519da9",
  );
  formData.set("zc_gad", "");
  formData.set(
    "xmIwtLD",
    "fbf925364d33434ade5766869ffa4f7e583e20b8a02e896fc3923dfdd98de205b588819d1a73f144da99f40896b2af9d",
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
