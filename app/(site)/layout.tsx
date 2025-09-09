import { Navigation } from "@/components/navigation";
import Footer from "@/components/footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout pour le site principal avec vos styles personnalisés
  return (
    <div className="min-h-screen bg-background  text-foreground">
      <Navigation />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
