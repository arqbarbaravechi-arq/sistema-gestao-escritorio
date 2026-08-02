"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  status: "pronto" | "em-breve";
}

// Todos os módulos já aprovados — os "prontos" apontam para telas reais,
// os "em breve" apontam para uma página de placeholder honesta, sem
// fingir que a funcionalidade já existe.
const NAV_ITEMS: NavItem[] = [
  { href: "/clients", label: "Clientes", icon: "👤", status: "pronto" },
  { href: "/dashboard", label: "Projetos", icon: "📁", status: "pronto" },
  { href: "/notifications", label: "Notificações", icon: "🔔", status: "pronto" },
  { href: "/obra", label: "Obra", icon: "🏗️", status: "em-breve" },
  { href: "/fornecedores", label: "Fornecedores", icon: "🧾", status: "em-breve" },
  { href: "/financeiro", label: "Financeiro", icon: "💰", status: "em-breve" },
  { href: "/biblioteca", label: "Biblioteca", icon: "📚", status: "em-breve" },
  { href: "/equipe", label: "Equipe", icon: "👥", status: "em-breve" },
  { href: "/portal-cliente", label: "Portal do Cliente", icon: "🔑", status: "pronto" },
  { href: "/templates", label: "Templates de Projeto", icon: "📐", status: "pronto" },
  { href: "/compras", label: "Gestão de Compras", icon: "🛒", status: "pronto" },
  { href: "/curva-abc", label: "Curva ABC de Custos", icon: "📊", status: "em-breve" },
  { href: "/crm", label: "CRM de Vendas", icon: "📇", status: "em-breve" },
  { href: "/pagamentos", label: "Pagamento Integrado", icon: "💳", status: "em-breve" },
  { href: "/agentes-ia", label: "Agentes de IA", icon: "🤖", status: "em-breve" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/login");
  }

  if (!user) return null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* Menu lateral */}
      <aside
        style={{
          width: "240px",
          borderRight: "1px solid #e5e5e5",
          padding: "1.5rem 1rem",
          flexShrink: 0,
        }}
      >
        <div style={{ marginBottom: "1.5rem", padding: "0 0.5rem" }}>
          <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>Sistema de Gestão</div>
          <div style={{ fontSize: "0.75rem", color: "#999" }}>Escritório de Arquitetura</div>
        </div>

        <nav>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const isReady = item.status === "pronto";

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem 0.6rem",
                  borderRadius: "6px",
                  marginBottom: "0.15rem",
                  textDecoration: "none",
                  color: isActive ? "#111" : isReady ? "#333" : "#aaa",
                  background: isActive ? "#f3f4f6" : "transparent",
                  fontSize: "0.88rem",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span>
                  <span style={{ marginRight: "0.5rem" }}>{item.icon}</span>
                  {item.label}
                </span>
                {!isReady && (
                  <span
                    style={{
                      fontSize: "0.62rem",
                      color: "#c2410c",
                      background: "#ffedd5",
                      borderRadius: "999px",
                      padding: "0.1rem 0.4rem",
                    }}
                  >
                    em breve
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "2rem", paddingTop: "1rem", borderTop: "1px solid #eee" }}>
          <div style={{ fontSize: "0.8rem", color: "#666", padding: "0 0.5rem" }}>{user.name}</div>
          <button
            onClick={handleLogout}
            style={{
              marginTop: "0.5rem",
              width: "100%",
              background: "none",
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "0.4rem",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo da página */}
      <main style={{ flex: 1, minWidth: 0 }}>{children}</main>
    </div>
  );
}
