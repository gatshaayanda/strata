import AdminGate from "@/app/admin/admin-gate";
import StrataOperationsDashboard from "@/components/StrataOperationsDashboard";

export default function AdminPage() {
  return <AdminGate><StrataOperationsDashboard /></AdminGate>;
}
