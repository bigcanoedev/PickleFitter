"use client";

import { ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiscountBadge } from "@/components/DiscountBadge";
import { getRetailerLinks } from "@/lib/utils";
import { Paddle } from "@/lib/types";
import { track } from "@vercel/analytics";

interface BuyButtonsProps {
  paddle: Paddle;
  compact?: boolean;
  size?: "default" | "sm";
}

export function BuyButtons({ paddle, compact = false, size = "default" }: BuyButtonsProps) {
  const links = getRetailerLinks(paddle);

  if (links.length === 0) return null;

  const trackClick = (retailer: string) => {
    track("affiliate_click", { paddle: `${paddle.brand} ${paddle.name}`, retailer, price: paddle.price });
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick(link.label)}
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
          >
            {link.label} <ExternalLink className="w-3 h-3" />
          </a>
        ))}
        <DiscountBadge discountCode={paddle.discount_code} compact />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Button
            key={link.label}
            asChild
            size={size}
            variant={link.primary ? "default" : "outline"}
            className="gap-1.5"
          >
            <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={() => trackClick(link.label)}>
              <ShoppingCart className="w-3.5 h-3.5" />
              {link.label}
            </a>
          </Button>
        ))}
      </div>
      <DiscountBadge discountCode={paddle.discount_code} />
    </div>
  );
}
