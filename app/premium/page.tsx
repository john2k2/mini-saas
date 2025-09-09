import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import PremiumContent from "@/app/components/premium-content";

export default async function PremiumPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");

  return <PremiumContent />;
}
