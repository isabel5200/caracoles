import { Link } from "react-router";
import type { ReactNode } from "react";

export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="auth-screen">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">🐌</span>
          <span>
            PISTA LENTA<span className="brand-dot">.</span>
          </span>
        </Link>
        <span className="top-note">UNA DEMO · SIN DINERO REAL</span>
      </header>
      <main className="auth-main">
        <div className="auth-intro">
          <span className="section-kicker">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="auth-art" aria-hidden="true">
            🐌
          </div>
        </div>
        <div className="auth-card">{children}</div>
      </main>
      <footer>
        <span>PISTA LENTA © 2026</span>
        <span>React · Express · TypeScript</span>
      </footer>
    </div>
  );
}
