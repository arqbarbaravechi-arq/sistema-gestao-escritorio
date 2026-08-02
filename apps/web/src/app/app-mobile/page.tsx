import AppShell from "@/components/AppShell";

export default function AppMobilePage() {
  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: "600px" }}>
        <h1 style={{ fontSize: "1.3rem", margin: 0 }}>App no Celular</h1>
        <p style={{ color: "#666", marginTop: "0.5rem" }}>
          O sistema já pode ser instalado no seu celular como um aplicativo — com ícone na tela
          inicial, abrindo em tela cheia, sem a barra do navegador.
        </p>

        <div
          style={{
            marginTop: "1.5rem",
            padding: "1.5rem",
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
          }}
        >
          <p style={{ fontWeight: "bold", fontSize: "0.9rem", margin: 0 }}>📱 No iPhone (Safari)</p>
          <ol style={{ paddingLeft: "1.2rem", fontSize: "0.85rem", color: "#333", marginTop: "0.5rem" }}>
            <li>Abra o sistema no Safari (precisa ser o Safari, não o Chrome)</li>
            <li>
              Toque no ícone de compartilhar (o quadrado com uma seta para cima), na barra de
              baixo
            </li>
            <li>Escolha &quot;Adicionar à Tela de Início&quot;</li>
            <li>Confirme o nome e toque em &quot;Adicionar&quot;</li>
          </ol>
        </div>

        <div
          style={{
            marginTop: "1rem",
            padding: "1.5rem",
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
          }}
        >
          <p style={{ fontWeight: "bold", fontSize: "0.9rem", margin: 0 }}>🤖 No Android (Chrome)</p>
          <ol style={{ paddingLeft: "1.2rem", fontSize: "0.85rem", color: "#333", marginTop: "0.5rem" }}>
            <li>Abra o sistema no Chrome</li>
            <li>
              Deve aparecer sozinho um aviso &quot;Instalar app&quot; ou &quot;Adicionar à tela
              inicial&quot; — toque nele
            </li>
            <li>
              Se não aparecer, toque nos três pontinhos (⋮) no canto superior direito → &quot;Instalar
              app&quot;
            </li>
          </ol>
        </div>

        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            border: "1px dashed #ccc",
            borderRadius: "8px",
            color: "#666",
            fontSize: "0.85rem",
          }}
        >
          🚧 Versão inicial: o app instalado precisa de internet para funcionar de verdade — ele
          não guarda os dados no celular para uso totalmente offline ainda. Isso é uma etapa
          futura, mais complexa.
        </div>
      </div>
    </AppShell>
  );
}
