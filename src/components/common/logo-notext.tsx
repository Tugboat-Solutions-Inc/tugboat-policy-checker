import Image from "next/image";

export default function LogoNoText({
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props}>
      <Image
        src="/icons/logo-no-text.svg"
        alt="Tugboat Logo"
        width={24}
        height={24}
        className="h-full object-contain w-auto"
      />
    </div>
  );
}
