import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export function DashboardPage() {
  const { user, balance, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-screen">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">🐌</span>
          <span>
            PISTA LENTA<span className="brand-dot">.</span>
          </span>
        </Link>
        <button className="text-button" type="button" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>
      <main className="dashboard-main">
        <span className="section-kicker">TU ESPACIO</span>
        <h1>Hola, {user?.fullName}.</h1>
        <p>
          Tu sesión está activa. Este dashboard queda listo para el futuro
          módulo de carreras.
        </p>
        <div className="dashboard-cards">
          <section className="info-card">
            <span>SALDO DISPONIBLE</span>
            <strong>
              {new Intl.NumberFormat("es-MX").format(balance ?? 0)}{" "}
              <small>créditos</small>
            </strong>
            <p>Créditos de demostración asignados al registrarte.</p>
          </section>
          <section className="info-card">
            <span>TU CUENTA</span>
            <strong className="account-name">{user?.fullName}</strong>
            <p>{user?.email}</p>
          </section>
        </div>
      </main>
      <footer>
        <span>PISTA LENTA © 2026</span>
        <span>Una demo sin dinero real</span>
      </footer>
    </div>
  );
}
