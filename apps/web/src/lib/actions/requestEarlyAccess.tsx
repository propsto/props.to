"use server";

export async function requestEarlyAccess(formData: FormData) {
  formData.set(
    "xnQsjsdp",
    "3eb3afc7ccfde7a401ada6e6b9f9aa7c9282cde4dc2ee4a23e114ad87745f81b"
  );
  formData.set("zc_gad", "");
  formData.set(
    "xmIwtLD",
    "c5a67418196961f2e9099d9c25aa7914ac21cbab455fc50f715214cff65bea2bc3b6ffa9e0d71ff2dd61fffb4d525011"
  );
  formData.set("actionType", "TGVhZHM=");
  formData.set("returnURL", "null");

  const response = await fetch(`https://crm.zoho.com/crm/WebToLeadForm`, {
    method: "POST",
    body: formData,
  });
  if (response.status === 200) {
    return { message: "Success!" };
  } else {
    return { message: "There was an error." };
  }
}
