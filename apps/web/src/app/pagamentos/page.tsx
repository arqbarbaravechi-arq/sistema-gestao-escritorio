import AppShell from "@/components/AppShell";
import ComingSoon from "@/components/ComingSoon";

export default function Page() {
  return (
    <AppShell>
      <ComingSoon
        title="Pagamento Integrado"
        description="Cobrar o cliente direto pelo sistema."
        phase="CR-001, item 7"
      />
    </AppShell>
  );
}
