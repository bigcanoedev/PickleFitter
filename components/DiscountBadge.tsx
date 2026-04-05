"use client";

import { Tag, Copy, Check } from "lucide-react";
import { useState } from "react";
import { parseDiscountCode } from "@/lib/utils";

interface DiscountBadgeProps {
  discountCode: string | null | undefined;
  compact?: boolean;
}

export function DiscountBadge({ discountCode, compact = false }: DiscountBadgeProps) {
  const [copied, setCopied] = useState(false);

  if (!discountCode) return null;

  const { code, description } = parseDiscountCode(discountCode);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
    }
  };

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
        <Tag className="w-3 h-3" />
        <span className="font-medium">{code}</span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-md px-2 py-1">
      <Tag className="w-3 h-3 shrink-0" />
      <span>
        Code: <span className="font-bold">{code}</span>
        {description && <span className="text-emerald-600 dark:text-emerald-500"> — {description}</span>}
      </span>
      <button
        onClick={handleCopy}
        className="ml-1 p-0.5 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
        title="Copy code"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}
