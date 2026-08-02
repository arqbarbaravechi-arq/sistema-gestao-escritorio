import AppShell from "@/components/AppShell";
import ComingSoon from "@/components/ComingSoon";

export default function Page() {
  return (
    <AppShell>
      <ComingSoon
        title="Financeiro"
        description="Visao de contratos e parcelas, espelhando o financeiro real."
        phase="Fase 3"
      />
    </AppShell>
  );
}
