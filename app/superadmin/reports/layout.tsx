import { ReportsSubnav } from "@/components/superadmin/ReportsSubnav";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ReportsSubnav />
      {children}
    </div>
  );
}
