import Image from "next/image";

export default function Logo({
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props}>
      <Image
        src="/images/logo-with-text.png"
        alt="Tugboat Logo"
        width={100}
        height={24}
        className="h-full object-contain w-auto"
      />
    </div>
  );
}
