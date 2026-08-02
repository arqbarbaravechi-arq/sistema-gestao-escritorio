import AppShell from "@/components/AppShell";
import ComingSoon from "@/components/ComingSoon";

export default function Page() {
  return (
    <AppShell>
      <ComingSoon
        title="Fornecedores"
        description="Diretorio de fornecedores com historico de precos."
        phase="Fase 2"
      />
    </AppShell>
  );
}
