import { SuperAdminGate } from "@/components/superadmin/SuperAdminGate";
import { SuperAdminShell } from "@/components/superadmin/SuperAdminShell";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SuperAdminGate>
      <SuperAdminShell>{children}</SuperAdminShell>
    </SuperAdminGate>
  );
}
