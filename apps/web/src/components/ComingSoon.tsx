interface ComingSoonProps {
  title: string;
  description: string;
  phase: string;
}

export default function ComingSoon({ title, description, phase }: ComingSoonProps) {
  return (
    <div style={{ padding: "2rem", maxWidth: "600px" }}>
      <h1 style={{ fontSize: "1.3rem", margin: 0 }}>{title}</h1>
      <p style={{ color: "#666", marginTop: "0.5rem" }}>{description}</p>

      <div
        style={{
          marginTop: "1.5rem",
          padding: "1.5rem",
          border: "1px dashed #ccc",
          borderRadius: "8px",
          color: "#666",
        }}
      >
        <p style={{ margin: 0 }}>
          🚧 Este módulo ainda não foi construído — está no plano ({phase}), aprovado, mas sem
          código ainda.
        </p>
      </div>
    </div>
  );
}
