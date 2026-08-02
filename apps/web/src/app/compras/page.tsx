import AppShell from "@/components/AppShell";
import ComingSoon from "@/components/ComingSoon";

export default function Page() {
  return (
    <AppShell>
      <ComingSoon
        title="Gestao de Compras"
        description="Comparar cotacoes de fornecedores diferentes."
        phase="CR-001, item 3"
      />
    </AppShell>
  );
}
