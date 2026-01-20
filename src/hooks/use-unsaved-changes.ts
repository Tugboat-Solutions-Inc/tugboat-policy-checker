"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean;
}

export function useUnsavedChanges({
  hasUnsavedChanges,
}: UseUnsavedChangesOptions) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const pendingNavigationRef = useRef<string | null>(null);
  const isBackNavigationRef = useRef(false);
  const previousUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (document.referrer && !previousUrlRef.current) {
      try {
        const referrerUrl = new URL(document.referrer);
        if (referrerUrl.origin === window.location.origin) {
          previousUrlRef.current = referrerUrl.pathname;
        }
      } catch {
        // Invalid referrer, ignore
      }
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    history.pushState({ unsavedChangesGuard: true }, "", window.location.href);

    const handlePopState = () => {
      history.pushState(
        { unsavedChangesGuard: true },
        "",
        window.location.href
      );
      isBackNavigationRef.current = true;
      setShowDialog(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor && anchor.href && !anchor.href.startsWith("javascript:")) {
        const url = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);

        if (url.pathname !== currentUrl.pathname) {
          e.preventDefault();
          e.stopPropagation();
          pendingNavigationRef.current = url.pathname;
          isBackNavigationRef.current = false;
          setShowDialog(true);
        }
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [hasUnsavedChanges]);

  const handleLeave = useCallback(() => {
    const url = pendingNavigationRef.current;
    const isBack = isBackNavigationRef.current;
    const previousUrl = previousUrlRef.current;

    setShowDialog(false);
    pendingNavigationRef.current = null;
    isBackNavigationRef.current = false;

    if (isBack) {
      if (previousUrl) {
        router.push(previousUrl);
      } else {
        router.push("/dashboard");
      }
    } else if (url) {
      router.push(url);
    }
  }, [router]);

  const handleOpenChange = useCallback((open: boolean) => {
    setShowDialog(open);
    if (!open) {
      pendingNavigationRef.current = null;
      isBackNavigationRef.current = false;
    }
  }, []);

  return {
    showDialog,
    handleOpenChange,
    handleLeave,
  };
}
