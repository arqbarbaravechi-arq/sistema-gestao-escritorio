import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sistema de Gestão — Escritório de Arquitetura",
  description: "Sprint 0 — ambiente em preparação",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
