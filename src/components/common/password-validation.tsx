"use client";

import { CircleCheck } from "lucide-react";
import { motion } from "framer-motion";

interface PasswordValidationProps {
  password: string;
  id?: string;
}

export default function PasswordValidation({
  password,
  id,
}: PasswordValidationProps) {
  const rules = [
    {
      label: "At least one uppercase letter",
      isValid: /[A-Z]/.test(password),
    },
    {
      label: "8 characters minimum",
      isValid: password.length >= 8,
    },
    {
      label: "At least one number",
      isValid: /[0-9]/.test(password),
    },
  ];

  const allValid = rules.every(r => r.isValid);

  return (
    <motion.ul
      id={id}
      className="flex flex-col gap-1.5 overflow-hidden list-none p-0 m-0"
      initial={{ opacity: 0, height: 0 }}
      animate={{ 
        opacity: 1, 
        height: "auto",
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      exit={{ 
        opacity: 0, 
        height: 0,
        transition: { duration: 0.15, ease: "easeInOut" }
      }}
      role="list"
      aria-label="Password requirements"
      aria-live="polite"
    >
      {rules.map(({ label, isValid }, index) => (
        <ValidationItem 
          key={label} 
          label={label} 
          isValid={isValid} 
          delay={index * 0.03}
        />
      ))}
      <span className="sr-only">
        {allValid 
          ? "All password requirements met" 
          : `${rules.filter(r => !r.isValid).length} requirements remaining`
        }
      </span>
    </motion.ul>
  );
}

function ValidationItem({
  label,
  isValid,
  delay,
}: {
  label: string;
  isValid: boolean;
  delay: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -6 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.15, delay: 0.06 + delay, ease: "easeOut" }
      }}
      exit={{ 
        opacity: 0,
        transition: { duration: 0.06 }
      }}
      className="flex items-center gap-2 text-sm"
      aria-label={`${label}: ${isValid ? "met" : "not met"}`}
    >
      <motion.span
        animate={{
          scale: isValid ? [1, 1.12, 1] : 1,
          color: isValid ? "#22c55e" : "#9ca3af",
        }}
        transition={{
          scale: { duration: 0.15 },
          color: { duration: 0.12 },
        }}
        aria-hidden="true"
      >
        <CircleCheck className="size-4" />
      </motion.span>
      <motion.span
        animate={{
          color: isValid ? "#22c55e" : "#9ca3af",
        }}
        transition={{ duration: 0.12 }}
      >
        {label}
      </motion.span>
    </motion.li>
  );
}
