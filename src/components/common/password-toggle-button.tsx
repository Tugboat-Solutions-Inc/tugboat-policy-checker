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
      aria-pressed={isVisible}
      onMouseDown={(e) => e.preventDefault()}
      className={`absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
    >
      {isVisible ? (
        <Eye size={20} aria-hidden="true" />
      ) : (
        <EyeOff size={20} aria-hidden="true" />
      )}
    </button>
  );
}
