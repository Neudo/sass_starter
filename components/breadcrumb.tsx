"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav
      className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`}
      aria-label="Breadcrumb"
    >
      <Link href="/" className="flex items-center transition-colors">
        <Home className="h-4 w-4" />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          {item.href ? (
            <Link href={item.href} className="transition-colors font-medium">
              {item.label}
            </Link>
          ) : (
            <span
              className="text-gray-900 dark:text-white font-medium"
              aria-current="page"
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Helper function to generate breadcrumb items for common paths
export function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];

  segments.forEach((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;

    // Custom labels for common segments
    const labelMap: Record<string, string> = {
      blog: "Blog",
      dashboard: "Dashboard",
      auth: "Authentication",
      settings: "Settings",
      "use-cases": "Use Cases",
    };

    const label =
      labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    items.push({
      label,
      href: isLast ? undefined : href,
    });
  });

  return items;
}
