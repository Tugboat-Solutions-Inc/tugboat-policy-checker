import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid md:grid-cols-[1fr_1fr] h-screen p-4 md:p-8 gap-4 md:gap-8 overflow-hidden">
      <main className="max-w-96 mx-auto py-6 md:py-12 w-full flex flex-col overflow-hidden">
        {children}
      </main>
      <div className="rounded-2xl overflow-hidden hidden md:block h-full">
        <Image
          src="/images/auth-side-image.jpg"
          alt="Auth Side Image"
          width={1280}
          height={720}
          className="h-full object-cover object-right w-full"
        />
      </div>
    </div>
  );
}
