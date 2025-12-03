/**
 * Layout general para el grupo (dashboard)
 * NO incluye sidebar - cada rol tiene su propio layout con sidebar
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
