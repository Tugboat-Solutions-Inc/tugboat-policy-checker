import Link from "next/link";

interface TextLinkProps {
  label: string;
  href: string;
}

export default function TextLink({ label, href }: TextLinkProps) {
  return (
    <Link
      className="text-sm font-medium text-muted-foreground underline hover:text-muted-foreground-2 transition-colors rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      href={href}
    >
      {label}
    </Link>
  );
}
