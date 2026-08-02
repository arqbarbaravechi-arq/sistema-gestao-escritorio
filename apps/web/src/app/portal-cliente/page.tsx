import AppShell from "@/components/AppShell";
import ComingSoon from "@/components/ComingSoon";

export default function Page() {
  return (
    <AppShell>
      <ComingSoon
        title="Portal do Cliente"
        description="Cliente acompanha o projeto sem precisar perguntar no WhatsApp."
        phase="CR-001, item 1"
      />
    </AppShell>
  );
}
