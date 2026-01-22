"use client";

import Link from "next/link";

interface NavLinkProps extends React.ComponentProps<typeof Link> {
  children: React.ReactNode;
}

export function NavLink({ href, children, ...props }: NavLinkProps) {
  return (
    <Link
      {...props}
      href={href}
      prefetch={true}
    >
      {children}
    </Link>
  );
}
