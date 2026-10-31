// One rubric section; a level's rubric is an ordered list of them
export type OrgLevelRubricSection = { title: string; body: string };

function isSection(section: unknown): section is OrgLevelRubricSection {
  return (
    typeof section === "object" &&
    section !== null &&
    typeof (section as OrgLevelRubricSection).title === "string" &&
    typeof (section as OrgLevelRubricSection).body === "string"
  );
}

// Rubric Json as stored, read defensively: anything malformed reads as no section
export function parseRubric(rubric: unknown): OrgLevelRubricSection[] {
  if (!Array.isArray(rubric)) return [];
  return rubric.filter(isSection).map(({ title, body }) => ({ title, body }));
}

// Rubric as saved: trimmed, sections with no title and no body dropped
export function cleanRubric(rubric: unknown): OrgLevelRubricSection[] {
  return parseRubric(rubric)
    .map(s => ({ title: s.title.trim(), body: s.body.trim() }))
    .filter(s => s.title || s.body);
}
