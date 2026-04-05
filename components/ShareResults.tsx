"use client";

import { useState } from "react";
import { Link2, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareResultsProps {
  paddleName: string;
  matchPercentage: number;
}

export function ShareResults({ paddleName, matchPercentage }: ShareResultsProps) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `My #1 pickleball paddle match is the ${paddleName} at ${matchPercentage}%! Find yours:`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, "_blank", "width=550,height=420");
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: "My PickleFitter Match", text: shareText, url });
    } catch {}
  };

  const hasNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Share:</span>
      <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 gap-1 text-xs">
        {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Link2 className="w-3.5 h-3.5" />}
        {copied ? "Copied!" : "Copy Link"}
      </Button>
      <Button variant="ghost" size="sm" onClick={handleTwitter} className="h-7 px-2 gap-1 text-xs">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        Post
      </Button>
      {hasNativeShare && (
        <Button variant="ghost" size="sm" onClick={handleNativeShare} className="h-7 px-2 gap-1 text-xs">
          <Share2 className="w-3.5 h-3.5" />
          Share
        </Button>
      )}
    </div>
  );
}
