export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Ou utilisez une classe personnalisée ou un style inline */}
      {/* <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}> */}
      {children}
    </div>
  );
}