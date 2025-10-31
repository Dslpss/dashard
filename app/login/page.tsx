"use client";
import React, { useState } from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      console.debug("login: sending", { username });
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/");
        return;
      }

      // Try to parse JSON, but be resilient to non-JSON responses
      let data: Record<string, unknown> | null = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.warn("login: response is not JSON", parseErr);
      }

      if (data && typeof data.error === "string") {
        setError(data.error);
      } else {
        // fallback to status text or generic message
        const text = (res && res.statusText) || "Credenciais inválidas";
        setError(text);
      }
    } catch (err) {
      console.error("login: network/error", err);
      setError("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.background} />
      <main className={styles.card} aria-labelledby="login-title">
        <div className={styles.brand}>
          <div className={styles.logo} aria-hidden>
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#g)" />
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0" stopColor="#7C3AED" />
                  <stop offset="1" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 id="login-title" className={styles.title}>
              Dashard — Acesso Restrito
            </h1>
            <p className={styles.subtitle}>
              Somente administradores. Faça login para continuar.
            </p>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <label className={styles.field}>
            <span className={styles.label}>Usuário</span>
            <input
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="seu.usuario"
              autoComplete="username"
              required
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Senha</span>
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          <div className={styles.actions}>
            <button className={styles.primary} type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>

          <p className={styles.hint}>
            Se você for o administrador, envie o usuário e senha para adicionar
            (sem cadastro público).
          </p>
        </form>
      </main>
    </div>
  );
}
