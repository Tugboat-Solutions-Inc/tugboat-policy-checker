"use client";

import { useState, useCallback } from "react";
import { toast } from "@/components/common/toast/toast";

export interface ParsedDataBase {
  errors: string[];
  warnings: string[];
}

interface UseCsvParsingOptions<T extends ParsedDataBase> {
  parseFn: (file: File) => Promise<T>;
}

export function useCsvParsing<T extends ParsedDataBase>({
  parseFn,
}: UseCsvParsingOptions<T>) {
  const [parsedData, setParsedData] = useState<T | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const parseFile = useCallback(
    async (file: File) => {
      setIsParsing(true);
      try {
        const parsed = await parseFn(file);
        setParsedData(parsed);

        if (parsed.errors.length > 0) {
          toast.error("CSV validation failed", parsed.errors[0]);
        } else if (parsed.warnings.length > 0) {
          toast.warning("CSV has warnings", parsed.warnings[0]);
        }

        return parsed;
      } catch (error) {
        console.error("Failed to parse CSV:", error);
        toast.error("Failed to parse CSV", "Please check the file format");
        setParsedData(null);
        return null;
      } finally {
        setIsParsing(false);
      }
    },
    [parseFn]
  );

  const reset = useCallback(() => {
    setParsedData(null);
  }, []);

  return {
    parsedData,
    isParsing,
    parseFile,
    reset,
    hasErrors: (parsedData?.errors?.length ?? 0) > 0,
  };
}
