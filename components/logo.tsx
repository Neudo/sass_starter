"use client";
import { motion } from "motion/react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function Logo({
  size = "md",
  showText = true,
  className = "",
}: LogoProps) {
  const sizeMap = {
    sm: { container: "w-6 h-6", text: "text-sm" },
    md: { container: "w-8 h-8", text: "text-lg" },
    lg: { container: "w-12 h-12", text: "text-xl" },
    xl: { container: "w-16 h-16", text: "text-2xl" },
  };

  const sizes = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        className={`${sizes.container} relative rounded-xl bg-gradient-to-br from-primary via-primary/70 to-primary/90 shadow-lg overflow-hidden`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Fond avec effet de brillance */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50" />

        {/* Effet de brillance animé */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear",
          }}
        />

        {/* Flèche de croissance principale */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="w-1/2 h-1/2 text-primary-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Ligne de base montrant la progression */}
            <motion.path
              d="M3 17l4-4 4 4 6-6 2 2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, delay: 0.2 }}
            />
            {/* Flèche vers le haut */}
            <motion.path
              d="M19 7l-2 2-2-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.7 }}
            />
            <motion.path
              d="M19 7v6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 1.7 }}
            />
          </svg>
        </div>

        {/* Points de données animés */}
        <div className="absolute inset-0">
          {[
            { x: "20%", y: "70%", delay: 0.3 },
            { x: "45%", y: "50%", delay: 0.6 },
            { x: "70%", y: "30%", delay: 0.9 },
            { x: "85%", y: "20%", delay: 1.2 },
          ].map((point, index) => (
            <motion.div
              key={index}
              className="absolute w-1 h-1 bg-primary-foreground rounded-full"
              style={{ left: point.x, top: point.y }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: point.delay }}
            />
          ))}
        </div>
      </motion.div>

      {showText && (
        <motion.span
          className={`${sizes.text} font-bold text-foreground tracking-tight`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Dana Analytics
        </motion.span>
      )}
    </div>
  );
}
