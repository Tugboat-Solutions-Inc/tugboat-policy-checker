"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PageTransition } from "@/components/common/page-transition";
import Logo from "@/components/common/logo";
import { NavLink } from "@/components/common/nav-link";
import { ROUTES } from "@/config/routes";
import { createClient } from "@/utils/supabase/client";
import { decodeAccessToken } from "@/lib/jwt";

function useHashTokenHandler() {
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleHashToken = async () => {
      const hash = window.location.hash;
      
      if (!hash || !hash.includes("access_token")) {
        return;
      }

      setIsProcessing(true);

      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setIsProcessing(false);
        return;
      }

      try {
        const supabase = createClient();
        
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error("Error setting session:", error);
          setIsProcessing(false);
          return;
        }

        const decodedToken = decodeAccessToken(accessToken);
        const onboardingComplete = decodedToken?.onboarding_complete;

        if (onboardingComplete) {
          window.location.href = ROUTES.DASHBOARD.ROOT;
        } else {
          window.location.href = ROUTES.AUTH.SIGNUP_VERIFIED;
        }
      } catch (error) {
        console.error("Error processing token:", error);
        setIsProcessing(false);
      }
    };

    handleHashToken();
  }, []);

  return isProcessing;
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isProcessingToken = useHashTokenHandler();

  if (isProcessingToken) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div 
      className="grid md:grid-cols-[1fr_1fr] h-screen p-4 md:p-8 gap-4 md:gap-8 overflow-hidden"
      role="presentation"
    >
      <main 
        className="max-w-96 mx-auto py-6 md:py-12 w-full flex flex-col overflow-hidden"
        aria-label="Authentication"
      >
        <NavLink 
          href={ROUTES.HOME} 
          aria-label="Go to Tugboat homepage"
          className="inline-block mb-24 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm w-fit"
        >
          <Logo className="h-7" aria-hidden="true" />
          <span className="sr-only">Tugboat</span>
        </NavLink>
        <PageTransition>{children}</PageTransition>
      </main>
      
      <motion.aside 
        className="rounded-2xl overflow-hidden hidden md:block h-full relative"
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.96, x: 20 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          x: 0,
          transition: { 
            duration: 1,
            ease: [0.16, 1, 0.3, 1]
          }
        }}
      >
        <figure className="h-full w-full">
          <Image
            src="/images/auth-side-image.jpg"
            alt=""
            width={1280}
            height={720}
            className="h-full object-cover object-right w-full"
            priority
          />
        </figure>
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" 
          aria-hidden="true"
        />
      </motion.aside>
    </div>
  );
}
