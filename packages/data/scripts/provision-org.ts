/**
 * Provision a Google Workspace organization without going through onboarding.
 * Idempotent: on an existing org it only ensures the owner.
 *
 * Usage:
 *   pnpm --filter @propsto/data provision-org <hosted-domain> "<org name>" <owner-email>
 */

import { provisionOrganization } from "../repos/provision-org";

const [hostedDomain, name, ownerEmail] = process.argv.slice(2);

if (!hostedDomain || !name || !ownerEmail) {
  console.error(
    'Usage: pnpm --filter @propsto/data provision-org <hosted-domain> "<org name>" <owner-email>',
  );
  process.exit(1);
}

provisionOrganization({ hostedDomain, name, ownerEmail })
  .then(result => {
    if (!result.success) {
      console.error("Provisioning failed:", result.error);
      process.exit(1);
    }
    const { slug, createdOrganization, ownerAction } = result.data;
    console.log(
      createdOrganization
        ? `Created organization "${name}" (/${slug}) with owner ${ownerEmail}.`
        : `Organization /${slug} already exists; owner ${ownerEmail}: ${ownerAction === "none" ? "already OWNER" : ownerAction === "add" ? "added as OWNER" : "promoted to OWNER"}.`,
    );
    process.exit(0);
  })
  .catch(e => {
    console.error("Provisioning failed:", e);
    process.exit(1);
  });
