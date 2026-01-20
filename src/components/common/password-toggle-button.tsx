import { Eye, EyeOff } from "lucide-react";

interface PasswordToggleButtonProps {
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

export function PasswordToggleButton({
  isVisible,
  onToggle,
  className = "",
}: PasswordToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={isVisible ? "Hide password" : "Show password"}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground ${className}`}
    >
      {!isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  );
}
