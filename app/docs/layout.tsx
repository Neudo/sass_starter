import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import { RootProvider } from "fumadocs-ui/provider";
import "./layout.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-stone-950">
      <RootProvider>
        <DocsLayout tree={source.pageTree} {...baseOptions()}>
          {children}
        </DocsLayout>
      </RootProvider>
    </div>
  );
}
