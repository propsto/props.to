export type ReceivedValue = {
  id: string;
  name: string;
  organization: { id: string; name: string };
};

export type ValueGroup = {
  organization: { id: string; name: string };
  values: { id: string; name: string }[];
};

/**
 * Group the received-list filter values by organization, keeping the order they came in
 */
export function groupValuesByOrg(values: ReceivedValue[]): ValueGroup[] {
  const groups = new Map<string, ValueGroup>();
  for (const { id, name, organization } of values) {
    let group = groups.get(organization.id);
    if (!group) {
      group = { organization, values: [] };
      groups.set(organization.id, group);
    }
    group.values.push({ id, name });
  }
  return [...groups.values()];
}
