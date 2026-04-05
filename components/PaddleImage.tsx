"use client";

import { useState } from "react";
import Image from "next/image";
import { Paddle } from "@/lib/types";

interface PaddleImageProps {
  paddle: Paddle;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: { width: 80, height: 80 },
  md: { width: 120, height: 120 },
  lg: { width: 200, height: 200 },
};

export function PaddleImage({ paddle, size = "md", className = "" }: PaddleImageProps) {
  const [error, setError] = useState(false);
  const { width, height } = SIZES[size];

  // Only show if image_url points to a real file (starts with /images/)
  if (!paddle.image_url || !paddle.image_url.startsWith("/images/") || error) {
    return null;
  }

  return (
    <Image
      src={paddle.image_url}
      alt={`${paddle.brand} ${paddle.name}`}
      width={width}
      height={height}
      className={`object-contain ${className}`}
      onError={() => setError(true)}
    />
  );
}
