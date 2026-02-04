import { Building2 } from "lucide-react";
import { Badge } from "@propsto/ui/atoms/badge";

interface OrgBadgeProps {
  orgName: string;
  className?: string;
}

/**
 * Badge that indicates an item belongs to an organization.
 * Used in unified views where personal and org items appear together.
 */
export function OrgBadge({
  orgName,
  className,
}: OrgBadgeProps): React.JSX.Element {
  return (
    <Badge variant="outline" className={className}>
      <Building2 className="mr-1 h-3 w-3" />
      {orgName}
    </Badge>
  );
}
