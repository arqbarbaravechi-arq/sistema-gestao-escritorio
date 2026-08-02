import AppShell from "@/components/AppShell";

export default function ObraPage() {
  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: "600px" }}>
        <h1 style={{ fontSize: "1.3rem", margin: 0 }}>Obra</h1>
        <p style={{ color: "#666", marginTop: "0.5rem" }}>
          Cada projeto tem sua própria linha do tempo de visitas técnicas — abra o projeto em
          &quot;Projetos&quot; para registrar e ver o histórico.
        </p>

        <div
          style={{
            marginTop: "1.5rem",
            padding: "1.5rem",
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.9rem" }}>O que já funciona</p>
          <ul style={{ paddingLeft: "1.2rem", fontSize: "0.85rem", color: "#333" }}>
            <li>Registrar uma visita com observação</li>
            <li>
              Marcar &quot;preciso comunicar isso ao cliente&quot; — cria um rastro de que algo
              importante foi identificado, útil se surgir dúvida no futuro sobre o que foi
              avisado e quando
            </li>
            <li>Ver o histórico completo de visitas de cada projeto</li>
          </ul>
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
          🚧 <strong>O que ainda não existe:</strong> anexar fotos à visita. Isso depende de um
          serviço de armazenamento de arquivos (com chaves de acesso que só você pode fornecer) —
          por enquanto, o registro é só em texto.
        </div>
      </div>
    </AppShell>
  );
}
