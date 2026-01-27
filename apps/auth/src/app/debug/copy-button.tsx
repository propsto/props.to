"use client";

import { useState } from "react";

export function CopyButton({ data }: { data: Record<string, unknown> }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const json = JSON.stringify(data, null, 2);
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
    >
      {copied ? "Copied!" : "Copy as JSON"}
    </button>
  );
}
