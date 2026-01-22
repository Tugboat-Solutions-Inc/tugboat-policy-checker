"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/common/page-transition";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="grid md:grid-cols-[1fr_1fr] h-screen p-4 md:p-8 gap-4 md:gap-8 overflow-hidden"
      role="presentation"
    >
      <main 
        className="max-w-96 mx-auto py-6 md:py-12 w-full flex flex-col overflow-hidden"
        aria-label="Authentication"
      >
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
