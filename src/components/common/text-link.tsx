"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface TextLinkProps {
  label: string;
  href: string;
  className?: string;
}

export default function TextLink({ label, href, className }: TextLinkProps) {
  return (
    <Link
      className={cn(
        "text-sm font-medium text-muted-foreground underline hover:text-muted-foreground-2 transition-colors rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      href={href}
      prefetch={true}
    >
      {label}
    </Link>
  );
}
