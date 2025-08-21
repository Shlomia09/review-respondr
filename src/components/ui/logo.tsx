import { cn } from "@/lib/utils";
import revaiLogo from "@/assets/revai-logo.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-6 w-auto",
    md: "h-8 w-auto",
    lg: "h-12 w-auto"
  };

  return (
    <img
      src={revaiLogo}
      alt="RevAI Logo"
      className={cn(sizeClasses[size], className)}
    />
  );
};

export { Logo };