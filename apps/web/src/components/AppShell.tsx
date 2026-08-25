"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: string;
}

interface SimpleNavItem {
  href: string;
  label: string;
}

interface DropdownNavItem {
  label: string;
  items: (SimpleNavItem & { ready: boolean })[];
}

const MAIN_ITEMS: SimpleNavItem[] = [
  { href: "/dashboard", label: "Projetos" },
  { href: "/clients", label: "Clientes" },
  { href: "/crm", label: "CRM" },
  { href: "/notifications", label: "Notificações" },
];

const GERENCIADOR: DropdownNavItem = {
  label: "Gerenciador",
  items: [
    { href: "/obra", label: "Obra", ready: true },
    { href: "/compras", label: "Gestão de Compras", ready: true },
    { href: "/curva-abc", label: "Curva ABC de Custos", ready: true },
    { href: "/biblioteca", label: "Biblioteca", ready: true },
    { href: "/templates", label: "Templates de Projeto", ready: true },
  ],
};

const ADMINISTRATIVO: DropdownNavItem = {
  label: "Administrativo",
  items: [
    { href: "/financeiro", label: "Financeiro", ready: true },
    { href: "/pagamentos", label: "Pagamento Integrado", ready: true },
    { href: "/equipe", label: "Equipe", ready: true },
    { href: "/portal-cliente", label: "Portal do Cliente", ready: true },
    { href: "/app-mobile", label: "App no Celular", ready: true },
  ],
};

const DROPDOWNS = [GERENCIADOR, ADMINISTRATIVO];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/login");
  }

  function isDropdownActive(dropdown: DropdownNavItem) {
    return dropdown.items.some((i) => i.href === pathname);
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh" }}>
      <nav className="sga-nav" ref={navRef}>
        <Link href="/dashboard" className="sga-nav-logo">
          <span className="sga-nav-logo-mark" />
          <span className="sga-nav-logo-text">Sistema de Gestão</span>
        </Link>

        <div className="sga-nav-items" data-desktop-nav>
          {MAIN_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sga-nav-item ${pathname === item.href ? "sga-nav-item-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}

          {DROPDOWNS.map((dropdown) => (
            <div key={dropdown.label} style={{ position: "relative", height: "100%" }}>
              <button
                className={`sga-nav-item ${isDropdownActive(dropdown) ? "sga-nav-item-active" : ""}`}
                onClick={() =>
                  setOpenDropdown(openDropdown === dropdown.label ? null : dropdown.label)
                }
              >
                {dropdown.label}
              </button>
              {openDropdown === dropdown.label && (
                <div className="sga-dropdown">
                  {dropdown.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="sga-dropdown-item"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {item.label}
                      {!item.ready && <span className="sga-dropdown-item-badge">em breve</span>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sga-nav-icons">
          <Link href="/notifications" className="sga-nav-icon-btn" title="Notificações">
            🔔
          </Link>
          <button
            className="sga-nav-icon-btn"
            title={user.name}
            onClick={handleLogout}
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#fff",
              background: "var(--color-primary)",
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
          <button
            className="sga-nav-icon-btn"
            data-mobile-toggle
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: "none" }}
          >
            ☰
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          data-mobile-menu
          style={{
            borderBottom: "1px solid var(--color-border)",
            padding: "0.5rem 1rem 1rem",
            background: "#fff",
          }}
        >
          {[...MAIN_ITEMS, ...DROPDOWNS.flatMap((d) => d.items)].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "block",
                padding: "0.6rem 0.3rem",
                fontSize: "0.9rem",
                color:
                  pathname === item.href ? "var(--color-text)" : "var(--color-text-secondary)",
                fontWeight: pathname === item.href ? 700 : 400,
                textDecoration: "none",
                borderBottom: "1px solid var(--color-bg-subtle)",
              }}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="sga-btn sga-btn-secondary"
            style={{ marginTop: "0.75rem", width: "100%" }}
          >
            Sair
          </button>
        </div>
      )}

      <main>{children}</main>

      <style>{`
        @media (max-width: 860px) {
          [data-desktop-nav] { display: none !important; }
          [data-mobile-toggle] { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
