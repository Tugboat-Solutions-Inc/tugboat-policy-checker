import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";

export default function CollectionNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <h1 className="text-2xl font-semibold text-foreground">
        Collection Not Found
      </h1>
      <p className="text-muted-foreground">
        The collection you're looking for doesn't exist or has been deleted.
      </p>
      <Button>
        <Link href={ROUTES.DASHBOARD.ROOT}>Back to Dashboard</Link>
      </Button>
    </div>
  );
}
