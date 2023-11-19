import { useState } from "react";

interface SidebarLinkGroupProps {
  children: React.ReactNode;
  title: string;
  open: boolean;
}

export default function SidebarLinkGroup({
  children,
  title,
  open,
}: SidebarLinkGroupProps) {
  const [linkOpen, setLinkOpen] = useState<boolean>(open);

  return (
    <li>
      <a
        className="flex items-center text-sm font-bold text-slate-800"
        href="#0"
        onClick={(e) => {
          e.preventDefault();
          setLinkOpen(!linkOpen);
        }}
        aria-expanded={linkOpen}
      >
        <svg
          className={`fill-slate-400 mr-2 ${linkOpen && "rotate-90"}`}
          width="8"
          height="8"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M2.854.647A.5.5 0 0 0 2 1v6a.5.5 0 0 0 .854.354l3-3a.5.5 0 0 0 .058-.638l-.058-.07-3-3Z" />
        </svg>
        <span>{title}</span>
      </a>
      <ul className={`pl-6 mt-2 space-y-2 text-sm ${!linkOpen && "hidden"}`}>
        {children}
      </ul>
    </li>
  );
}
