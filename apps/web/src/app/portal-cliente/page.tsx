import AppShell from "@/components/AppShell";

export default function PortalClientePage() {
  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: "600px" }}>
        <h1 style={{ fontSize: "1.3rem", margin: 0 }}>Portal do Cliente</h1>
        <p style={{ color: "#666", marginTop: "0.5rem" }}>
          Cada projeto tem seu próprio link de acompanhamento — não existe uma tela única de
          &quot;portal&quot; aqui, porque cada cliente só deve ver o projeto dele.
        </p>

        <div
          style={{
            marginTop: "1.5rem",
            padding: "1.5rem",
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.9rem" }}>Como usar</p>
          <ol style={{ paddingLeft: "1.2rem", fontSize: "0.85rem", color: "#333" }}>
            <li>Abra o projeto desejado em &quot;Projetos&quot;</li>
            <li>Clique em &quot;Copiar link&quot; na seção &quot;Link para o cliente acompanhar&quot;</li>
            <li>Envie esse link para o cliente (WhatsApp, e-mail, onde preferir)</li>
          </ol>
          <p style={{ fontSize: "0.75rem", color: "#999", marginTop: "0.5rem" }}>
            O cliente não precisa criar conta nem fazer login — só abrir o link.
          </p>
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
          🚧 Versão inicial: o link mostra progresso das etapas. Envio automático por e-mail e
          aprovações diretas pelo cliente ainda não foram construídos — dependem de um provedor
          de e-mail configurado.
        </div>
      </div>
    </AppShell>
  );
}
