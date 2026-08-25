import AppShell from "@/components/AppShell";

export default function PagamentosPage() {
  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: "600px" }}>
        <h1 style={{ fontSize: "1.3rem", margin: 0 }}>Pagamento Integrado</h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.5rem" }}>
          Não existe uma tela única de &quot;pagamentos&quot; — cada projeto tem sua própria
          seção de cobranças. Abra o projeto em &quot;Projetos&quot; para criar e acompanhar.
        </p>

        <div
          style={{
            marginTop: "1.5rem",
            padding: "1.5rem",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.9rem" }}>O que já funciona</p>
          <ul style={{ paddingLeft: "1.2rem", fontSize: "0.85rem", color: "#333" }}>
            <li>Criar uma cobrança (descrição + valor) dentro do projeto</li>
            <li>Marcar como paga quando o dinheiro chegar</li>
            <li>Ver o histórico de cobranças de cada projeto</li>
          </ul>
        </div>

        <div
          style={{
            marginTop: "1rem",
            padding: "1.5rem",
            border: "1px dashed #ccc",
            borderRadius: "12px",
            color: "var(--color-text-secondary)",
            fontSize: "0.85rem",
          }}
        >
          🚧 <strong>O que ainda não existe:</strong> processar o pagamento de verdade dentro do
          sistema (cartão, Pix automático, link de cobrança que o cliente paga direto). Isso exige
          uma conta em um provedor de pagamento (Mercado Pago, Stripe, etc.) — que envolve CNPJ,
          conta bancária e chaves de acesso que só você pode fornecer. Quando quiser avançar nessa
          parte, é só avisar.
        </div>
      </div>
    </AppShell>
  );
}
