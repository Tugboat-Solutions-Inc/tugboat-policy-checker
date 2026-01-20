"use client";

import { useEffect, useState, useCallback } from "react";
import { getTemplates, type Template } from "../api/template.actions";

let cachedTemplate: Template | null = null;
let fetchPromise: Promise<Template | null> | null = null;

async function fetchTemplate(): Promise<Template | null> {
  if (cachedTemplate) {
    return cachedTemplate;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = getTemplates()
    .then((result) => {
      if (result.success && result.data) {
        cachedTemplate = result.data;
        return cachedTemplate;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => {
      fetchPromise = null;
    });

  return fetchPromise;
}

export function prefetchTemplate(): void {
  fetchTemplate();
}

export function useTemplateCache() {
  const [template, setTemplate] = useState<Template | null>(cachedTemplate);
  const [isLoading, setIsLoading] = useState(!cachedTemplate);

  const load = useCallback(async () => {
    if (cachedTemplate) {
      setTemplate(cachedTemplate);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const data = await fetchTemplate();
    setTemplate(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { template, isLoading };
}
