"use client";

import { usePathname } from "next/navigation";
import { Breadcrumb, generateBreadcrumbItems } from "./breadcrumb";

interface PageBreadcrumbProps {
  className?: string;
  customItems?: Array<{ label: string; href?: string }>;
}

export function PageBreadcrumb({ className, customItems }: PageBreadcrumbProps) {
  const pathname = usePathname();
  
  // Use custom items if provided, otherwise generate from pathname
  const items = customItems || generateBreadcrumbItems(pathname);
  
  // Don't show breadcrumb on homepage
  if (pathname === "/" || items.length === 0) {
    return null;
  }
  
  return <Breadcrumb items={items} className={className} />;
}