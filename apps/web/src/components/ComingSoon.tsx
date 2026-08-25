interface ComingSoonProps {
  title: string;
  description: string;
  phase: string;
}

export default function ComingSoon({ title, description, phase }: ComingSoonProps) {
  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: "600px" }}>
      <h1 style={{ fontSize: "1.3rem", margin: 0 }}>{title}</h1>
      <p style={{ color: "var(--color-text-secondary)", marginTop: "0.5rem" }}>{description}</p>

      <div
        className="sga-card"
        style={{
          marginTop: "1.5rem",
          borderStyle: "dashed",
          color: "var(--color-text-secondary)",
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
