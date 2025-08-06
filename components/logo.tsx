"use client";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function Logo({
  size = "md",
  showText = false,
  className = "",
}: LogoProps) {
  // Size mapping based on the size prop
  const sizeMap = {
    sm: { container: "w-8 h-8", text: "text-lg" },
    md: { container: "h-12 w-12 md:h-20 md:w-20", text: "text-2xl leading-6" },
    lg: { container: "h-16 w-16", text: "text-2xl" },
    xl: { container: "h-20 w-20", text: "text-3xl" },
  };

  // Get the correct size values
  const containerSize = sizeMap[size].container;
  const textSize = sizeMap[size].text;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${containerSize} relative rounded-xl overflow-hidden`}>
        <Image
          src="/logo.svg"
          alt="Logo"
          width={100}
          height={100}
          className="w-full h-full object-contain"
        />
      </div>

      {showText && (
        <div>
          <h1 className={`${textSize} font-bold text-left`}>
            Hector <br /> Analytics
          </h1>
        </div>
      )}
    </div>
  );
}
