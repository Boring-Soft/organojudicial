import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { AuthProvider } from "@/providers/auth-provider";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  return <AuthProvider>{children}</AuthProvider>;
}
