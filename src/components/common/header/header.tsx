import { cn } from "@/lib/utils";

type HeaderProps = {
  title: string;
  children?: React.ReactNode;
  classname?: string;
  leadingButton?: React.ReactNode;
};

export default function Header({
  title,
  children,
  classname,
  leadingButton,
}: HeaderProps) {
  return (
    <header className={cn("w-full bg-background", classname)}>
      <div className="flex items-center justify-between">
        <div className="flex flex-row gap-4 items-center">
          {leadingButton}
          <h1 className="text-xl my-2 font-semibold ">{title}</h1>
        </div>
        {children}
      </div>
    </header>
  );
}
