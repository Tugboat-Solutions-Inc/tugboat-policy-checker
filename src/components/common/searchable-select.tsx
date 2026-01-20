"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  onOptionsChange?: (options: SelectOption[]) => void;
  placeholder?: string;
  allowCreate?: boolean;
  onCreate?: (option: SelectOption) => void;
  triggerClassName?: string;
  disabled?: boolean;
  maxVisibleItems?: number;
  itemHeight?: number;
}

export function SearchableSelect({
  options: initialOptions,
  value,
  onValueChange,
  onOptionsChange,
  placeholder = "Select...",
  allowCreate = false,
  onCreate,
  triggerClassName,
  disabled = false,
  maxVisibleItems = 6,
  itemHeight = 34,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [options, setOptions] = useState<SelectOption[]>(initialOptions);
  const [showTopChevron, setShowTopChevron] = useState(false);
  const [showBottomChevron, setShowBottomChevron] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const maxHeight = maxVisibleItems * itemHeight;

  useEffect(() => {
    setOptions(initialOptions);
  }, [initialOptions]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options;
    const query = inputValue.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(query));
  }, [options, inputValue]);

  const showCreateOption = useMemo(() => {
    if (!allowCreate || !inputValue.trim()) return false;
    const query = inputValue.toLowerCase().trim();
    return !options.some((opt) => opt.label.toLowerCase() === query);
  }, [allowCreate, inputValue, options]);

  const shouldShowDropdown =
    open && (filteredOptions.length > 0 || showCreateOption);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;

    setShowTopChevron(scrollTop > 0);
    setShowBottomChevron(scrollTop < scrollHeight - clientHeight - 1);
  };

  useEffect(() => {
    if (open && scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      const needsScroll = scrollHeight > clientHeight;
      setShowBottomChevron(needsScroll);
      setShowTopChevron(false);
    } else {
      setShowTopChevron(false);
      setShowBottomChevron(false);
    }
  }, [open, filteredOptions.length]);

  const handleSelect = (option: SelectOption) => {
    onValueChange(option.value);
    setInputValue("");
    setIsEditing(false);
    setOpen(false);
  };

  const handleCreate = () => {
    const newOption: SelectOption = {
      value: inputValue.trim(),
      label: inputValue.trim(),
    };
    const newOptions = [...options, newOption];
    setOptions(newOptions);
    onOptionsChange?.(newOptions);
    onCreate?.(newOption);
    onValueChange(newOption.value);
    setInputValue("");
    setIsEditing(false);
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsEditing(true);
    setOpen(true);
  };

  const handleFocus = () => {
    setIsEditing(true);
    setInputValue("");
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setInputValue("");
      setIsEditing(false);
    } else if (e.key === "Tab") {
      setOpen(false);
      setInputValue("");
      setIsEditing(false);
    }
  };

  const handleInteractOutside = (e: Event) => {
    if (inputRef.current && e.target === inputRef.current) {
      e.preventDefault();
      return;
    }
    setOpen(false);
    setInputValue("");
    setIsEditing(false);
  };

  const displayValue = isEditing ? inputValue : (selectedOption?.label ?? "");

  return (
    <Popover open={shouldShowDropdown} onOpenChange={() => {}}>
      <PopoverTrigger asChild>
        <div className={cn("relative", triggerClassName)}>
          <Input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="pr-8 h-12"
          />
          <ChevronDown
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 size-4 shrink-0 opacity-50 transition-transform pointer-events-none",
              open && "rotate-180"
            )}
          />
        </div>
      </PopoverTrigger>

      {shouldShowDropdown && (
        <PopoverContent
          align="start"
          className="p-0 bg-white w-(--radix-popover-trigger-width) overflow-hidden"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={handleInteractOutside}
          onWheelCapture={(e) => e.stopPropagation()}
        >
          <div
            className={cn(
              "flex items-center justify-center px-2 py-1 h-7 pointer-events-none transition-all duration-300 overflow-hidden",
              showTopChevron ? "opacity-100 max-h-7" : "opacity-0 max-h-0 py-0"
            )}
          >
            <ChevronUp className="size-4" />
          </div>

          <Command shouldFilter={false}>
            <CommandList
              ref={scrollContainerRef}
              onScroll={handleScroll}
              onWheelCapture={(e) => e.stopPropagation()}
              className="overflow-y-auto overscroll-contain"
              style={{ maxHeight }}
            >
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option)}
                  className={cn(
                    "flex items-center justify-between cursor-pointer",
                    value === option.value && "font-medium"
                  )}
                  style={{ height: itemHeight }}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && (
                    <Check className="size-4 shrink-0 text-primary" />
                  )}
                </CommandItem>
              ))}

              {showCreateOption && (
                <>
                  {filteredOptions.length > 0 && <Separator className="my-1" />}
                  <CommandItem
                    onSelect={handleCreate}
                    className="flex items-center gap-2 cursor-pointer font-medium"
                    style={{ height: itemHeight }}
                  >
                    <span>Create "{inputValue.trim()}"</span>
                  </CommandItem>
                </>
              )}
            </CommandList>
          </Command>

          <div
            className={cn(
              "flex items-center justify-center px-2 py-1 h-7 pointer-events-none transition-all duration-300 overflow-hidden",
              showBottomChevron
                ? "opacity-100 max-h-7"
                : "opacity-0 max-h-0 py-0"
            )}
          >
            <ChevronDown className="size-4" />
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
