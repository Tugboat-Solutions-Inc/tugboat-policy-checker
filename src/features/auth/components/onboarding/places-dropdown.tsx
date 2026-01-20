import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Command, CommandItem, CommandList } from "@/components/ui/command";

interface Place {
  placeId: string;
  description: string;
}

interface PlacesDropdownProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: Place) => void;
  places: Place[];
  placeholder?: string;
  className?: string;
  id?: string;
  viewOnly?: boolean;
}

export function PlacesDropdown({
  value,
  onChange,
  onPlaceSelect,
  places,
  placeholder = "Enter property address",
  className,
  id,
  viewOnly,
}: PlacesDropdownProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const shouldOpen = (val: string) => val.length > 0 && places.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    onChange(next);
    setOpen(shouldOpen(next));
  };

  const handleFocus = () => {
    if (shouldOpen(value)) {
      setOpen(true);
    }
  };

  const handlePlaceSelect = (place: Place) => {
    onChange(place.description);
    setOpen(false);
    onPlaceSelect?.(place);
  };

  return (
    <Popover open={open} onOpenChange={() => {}}>
      <PopoverTrigger asChild>
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          className={className}
          id={id}
          disabled={viewOnly}
        />
      </PopoverTrigger>

      {shouldOpen(value) && (
        <PopoverContent
          align="start"
          className="p-0 bg-white w-(--radix-popover-trigger-width)"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (inputRef.current && e.target === inputRef.current) {
              e.preventDefault();
              return;
            }
            setOpen(false);
          }}
        >
          <Command shouldFilter={false}>
            <CommandList>
              <div className="max-h-64 overflow-y-auto">
                {places.map((place) => (
                  <CommandItem
                    key={place.placeId}
                    onSelect={() => handlePlaceSelect(place)}
                  >
                    {place.description}
                  </CommandItem>
                ))}
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}
