"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Pencil, FileSpreadsheet } from "lucide-react";

interface AddUnitDropdownProps {
  onAddManually?: () => void;
  onImportSpreadsheet?: () => void;
}

export function AddUnitDropdown({
  onAddManually,
  onImportSpreadsheet,
}: AddUnitDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="sm" className="h-9 gap-2">
          Add Unit
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1">
        <DropdownMenuItem
          className="gap-2.5 pl-2 pr-2 py-3 rounded-lg cursor-pointer"
          onClick={onAddManually}
        >
          <Pencil className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium leading-none">Add manually</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2.5 pl-2 pr-2 py-3 rounded-lg cursor-pointer"
          onClick={onImportSpreadsheet}
        >
          <FileSpreadsheet className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-medium leading-none">
            Import spreadsheet
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

