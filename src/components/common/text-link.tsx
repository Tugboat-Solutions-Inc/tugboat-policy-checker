import Link from "next/link";

export default function TextLink({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <Link
      className="text-sm font-medium text-muted-foreground underline hover:text-muted-foreground-2 transition-all"
      href={href}
    >
      {label}
    </Link>
  );
}
