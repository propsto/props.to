import { getUser, getOrganizationById } from "@propsto/data/repos";
import { Avatar, AvatarFallback, AvatarImage } from "@propsto/ui/atoms/avatar";
import { Badge } from "@propsto/ui/atoms/badge";

interface UserProfileHeaderProps {
  userId: string;
  slug: string;
  organizationId?: string;
}

export async function UserProfileHeader({
  userId,
  slug,
  organizationId,
}: UserProfileHeaderProps): Promise<React.JSX.Element> {
  const userResult = await getUser({ id: userId });
  const user = userResult.success ? userResult.data : null;

  let organization = null;
  if (organizationId) {
    const orgResult = await getOrganizationById(organizationId);
    organization = orgResult.success ? orgResult.data : null;
  }

  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
    : slug;

  const initials = displayName
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="text-center">
      <Avatar className="size-24 mx-auto">
        {user?.image && <AvatarImage src={user.image} alt={displayName} />}
        <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
      </Avatar>
      <h1 className="text-3xl font-bold mt-4">{displayName}</h1>
      <p className="text-muted-foreground">@{slug}</p>
      {organization && (
        <Badge variant="outline" className="mt-2">
          {organization.name}
        </Badge>
      )}
    </div>
  );
}
