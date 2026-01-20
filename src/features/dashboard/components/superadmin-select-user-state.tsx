import { Users } from "lucide-react";

export function SuperadminSelectUserState() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center max-w-md px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            Select a User
          </h2>
          <p className="text-muted-foreground">
            Choose an account from the sidebar to view their dashboard
          </p>
        </div>
      </div>
    </div>
  );
}
