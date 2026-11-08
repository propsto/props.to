-- /<org>/<group>/<slug> resolves by (slug, groupId), and the model-level
-- uniques carry NULL userId/entityId for team links, so nothing stopped two
-- links from sharing a group URL. One slug per group, person and team links
-- alike.
CREATE UNIQUE INDEX "FeedbackLink_group_slug_key" ON "FeedbackLink" (slug, "groupId") WHERE "groupId" IS NOT NULL;
