export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background px-4 py-10 md:py-14">
      <div className="mx-auto max-w-2xl">{children}</div>
    </div>
  );
}
