import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getEntityFeedbackLinkBySlug,
  getEntityForPublicPage,
} from "@propsto/data/repos";
import { gatedFeedbackForm } from "./link";

export async function entityMetadata(entityId: string): Promise<Metadata> {
  const entity = await getEntityForPublicPage(entityId);
  if (entity.success && entity.data) {
    return {
      title: `${entity.data.name} | ${entity.data.organization.name}`,
      description: `Give feedback on ${entity.data.name}`,
    };
  }
  return { title: `Feedback | props.to` };
}

// /<orgSlug>/<entitySlug>/<linkSlug>: feedback on a product, event, service
export async function entityPage({
  entityId,
  linkSlug,
  basePath,
  context,
}: {
  entityId: string;
  linkSlug: string;
  basePath: string;
  context?: string;
}): Promise<React.ReactNode> {
  const [entityResult, linkResult] = await Promise.all([
    getEntityForPublicPage(entityId),
    getEntityFeedbackLinkBySlug(linkSlug, entityId),
  ]);
  if (!entityResult.data || !linkResult.data) {
    notFound();
  }
  const entity = entityResult.data;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Give feedback on {entity.name}
        </h1>
        {entity.description && (
          <p className="text-muted-foreground">{entity.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-1">
          {entity.organization.name}
        </p>
      </div>
      {await gatedFeedbackForm(linkResult.data, basePath, false, context)}
    </div>
  );
}
