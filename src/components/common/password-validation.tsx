import { CircleCheck } from "lucide-react";

interface PasswordValidationProps {
  password: string;
}

export default function PasswordValidation({
  password,
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

  return (
    <div className="flex flex-col gap-1">
      {rules.map(({ label, isValid }) => (
        <ValidationItem key={label} label={label} isValid={isValid} />
      ))}
    </div>
  );
}

/** A small subcomponent for clarity */
function ValidationItem({
  label,
  isValid,
}: {
  label: string;
  isValid: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-sm transition-all ${
        isValid ? "text-green-500" : "text-muted-foreground"
      }`}
    >
      <CircleCheck className="size-4" />
      <span>{label}</span>
    </div>
  );
}
