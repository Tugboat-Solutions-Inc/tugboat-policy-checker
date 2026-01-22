import Image from "next/image";

export default function Logo({
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props}>
      <Image
        src="/images/tugboat-logo-v.svg"
        alt="Tugboat Logo"
        width={101}
        height={24}
        className="h-full object-contain w-auto"
      />
    </div>
  );
}
