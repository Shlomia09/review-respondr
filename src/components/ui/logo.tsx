import { cn } from "@/lib/utils";

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
      src="/lovable-uploads/2b66b53b-097c-41f2-b620-f18f499d7424.png"
      alt="RevAI Logo"
      className={cn(sizeClasses[size], className)}
    />
  );
};

export { Logo };