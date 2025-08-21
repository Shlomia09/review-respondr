import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-12 w-auto",
    md: "h-16 w-auto", 
    lg: "h-24 w-auto"
  };

  return (
    <img
      src="/lovable-uploads/4691da96-9ac2-48b6-ad0f-d167c83ff374.png"
      alt="RevAI Logo"
      className={cn(sizeClasses[size], className)}
    />
  );
};

export { Logo };