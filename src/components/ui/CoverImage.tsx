"use client";

import { BookOpen } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CoverImageProps {
  src: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-16 w-12",
  md: "h-40 w-28",
  lg: "h-64 w-44",
};

export default function CoverImage({
  src,
  alt,
  size = "md",
  className = "",
}: CoverImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`${sizeMap[size]} rounded-lg bg-surface-alt border border-border flex items-center justify-center flex-shrink-0 ${className}`}
      >
        <BookOpen className="h-1/3 w-1/3 text-text-muted" />
      </div>
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-lg overflow-hidden flex-shrink-0 relative ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        onError={() => setError(true)}
        sizes={size === "lg" ? "176px" : size === "md" ? "112px" : "48px"}
      />
    </div>
  );
}
