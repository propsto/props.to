import { Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@propsto/ui/atoms/avatar";
import { cn } from "@propsto/ui/lib/utils";

// The company's mark, taken from its Google Workspace domain's site icon:
// Google exposes no API for the logo set in the Workspace admin console.
// ponytail: Google's favicon service, add an uploaded logo when an org asks for one
function orgLogoUrl(hostedDomain?: string | null): string | undefined {
  return hostedDomain
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostedDomain)}&sz=128`
    : undefined;
}

export function OrgLogo({
  name,
  hostedDomain,
  className,
}: {
  name: string;
  hostedDomain?: string | null;
  className?: string;
}): React.JSX.Element {
  const src = orgLogoUrl(hostedDomain);
  return (
    <Avatar className={cn("size-8 rounded-lg", className)}>
      {src ? <AvatarImage src={src} alt={`${name} logo`} /> : null}
      <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
        <Building2 className="size-1/2" />
      </AvatarFallback>
    </Avatar>
  );
}
