"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function NavigateBackButton() {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        router.back();
      }}
      className=" h-6 w-6 rounded-[6px]"
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
  );
}
