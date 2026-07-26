"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
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

  if (!user) {
    return null; // evita flash de conteúdo antes do redirect
  }

  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: "1.25rem" }}>Olá, {user.name} 👋</h1>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "0.4rem 0.8rem",
            cursor: "pointer",
          }}
        >
          Sair
        </button>
      </div>

      <p style={{ color: "#666", fontSize: "0.9rem" }}>
        Papel: <strong>{user.role}</strong> · Organização: {user.organizationId}
      </p>

      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          border: "1px dashed #ccc",
          borderRadius: "8px",
          color: "#666",
        }}
      >
        <p>
          Login autenticado com sucesso — este é o estado real da Sprint 1 até agora
          (S1-2 e S1-3 concluídas).
        </p>
        <p>
          O módulo Projetos (S1-4 em diante) ainda não existe, então não há nada
          além disso para mostrar aqui por enquanto.
        </p>
      </div>
    </main>
  );
}
