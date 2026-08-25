"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Client } from "@/lib/types";

const MARITAL_STATUS_OPTIONS = [
  "",
  "Solteiro(a)",
  "Casado(a)",
  "União estável",
  "Divorciado(a)",
  "Viúvo(a)",
];

const fieldLabel: React.CSSProperties = {
  display: "block",
  fontSize: "0.85rem",
  marginBottom: "0.25rem",
};

const fieldInput: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem",
  boxSizing: "border-box",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "0.78rem",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  marginTop: "1.5rem",
  marginBottom: "0.75rem",
};

export default function NewClientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [address, setAddress] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [sameAsAddress, setSameAsAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiFetch<Client>("/clients", {
        method: "POST",
        body: JSON.stringify({
          name,
          email: email || undefined,
          phone: phone || undefined,
          cpf: cpf || undefined,
          birthDate: birthDate || undefined,
          maritalStatus: maritalStatus || undefined,
          address: address || undefined,
          projectAddress: (sameAsAddress ? address : projectAddress) || undefined,
        }),
      });
      router.push("/clients");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "520px", margin: "3rem auto", padding: "0 1.5rem 3rem" }}>
      <Link href="/clients" style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
        ← Voltar
      </Link>
      <h1 style={{ fontSize: "1.25rem", marginTop: "1rem" }}>Novo cliente</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
        Cadastre o cliente antes de criar o projeto dele. Só o nome é obrigatório — o resto pode
        ser preenchido depois.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={sectionTitle}>Dados básicos</div>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={fieldLabel}>Nome do cliente</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ex: Rafael Souza"
            style={fieldInput}
          />
        </label>

        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <label style={{ flex: 1 }}>
            <span style={fieldLabel}>CPF (opcional)</span>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              placeholder="000.000.000-00"
              style={fieldInput}
            />
          </label>
          <label style={{ flex: 1 }}>
            <span style={fieldLabel}>Data de nascimento (opcional)</span>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              style={fieldInput}
            />
          </label>
        </div>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={fieldLabel}>Estado civil (opcional)</span>
          <select
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            style={fieldInput}
          >
            {MARITAL_STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "" ? "Não informado" : opt}
              </option>
            ))}
          </select>
        </label>

        <div style={sectionTitle}>Contato</div>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={fieldLabel}>E-mail (opcional)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rafael@exemplo.com"
            style={fieldInput}
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={fieldLabel}>Telefone (opcional)</span>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(48) 99999-8888"
            style={fieldInput}
          />
        </label>

        <div style={sectionTitle}>Endereços</div>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={fieldLabel}>Endereço residencial / de correspondência (opcional)</span>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Rua, número, bairro, cidade/UF"
            style={fieldInput}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem", fontSize: "0.85rem" }}>
          <input
            type="checkbox"
            checked={sameAsAddress}
            onChange={(e) => setSameAsAddress(e.target.checked)}
          />
          Endereço da obra é o mesmo do residencial
        </label>

        {!sameAsAddress && (
          <label style={{ display: "block", marginBottom: "0.75rem" }}>
            <span style={fieldLabel}>Endereço da obra (opcional)</span>
            <input
              type="text"
              value={projectAddress}
              onChange={(e) => setProjectAddress(e.target.value)}
              placeholder="Rua, número, bairro, cidade/UF"
              style={fieldInput}
            />
          </label>
        )}

        {error && (
          <p style={{ color: "var(--color-danger)", fontSize: "0.85rem", marginTop: "0.5rem", marginBottom: "1rem" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.6rem",
            background: "#111111",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            cursor: "pointer",
            marginTop: "1rem",
          }}
        >
          {loading ? "Cadastrando..." : "Cadastrar cliente"}
        </button>
      </form>
    </main>
  );
}
