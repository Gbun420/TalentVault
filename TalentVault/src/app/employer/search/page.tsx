import { requireRole } from "@/lib/auth";
import EmployerSearch from "@/components/employer-search";

export const dynamic = "force-dynamic";

export default async function EmployerSearchPage() {
  await requireRole(["employer", "admin"], "/employer/search");
  return <EmployerSearch />;
}
