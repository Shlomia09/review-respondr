import { cn } from "@/lib/utils";
import revaiLogo from "@/assets/revai-logo.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-10 w-auto",
    md: "h-14 w-auto", 
    lg: "h-20 w-auto"
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