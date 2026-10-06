import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  BetResultsChart,
  SnailVictoriesChart,
} from "../components/DashboardCharts";
import { LoadingSpiral } from "../components/LoadingSpiral";
import { TopUpPanel } from "../components/TopUpPanel";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { raceCount } from "../mock/dashboardStats";
import { waitForLoadingCue } from "../utils/loading";
import caracol from "../assets/caracol.png";

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function DashboardPage() {
  const { user, balance, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    await waitForLoadingCue();
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-enter flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <header className="flex min-h-20 items-center justify-between gap-4 bg-slate-900 px-6 py-4 text-white sm:px-[5vw]">
        <Link
          className="flex items-center gap-2 text-lg font-black tracking-widest text-white transition-colors hover:text-emerald-200 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
          to="/"
        >
          <img src={caracol} alt="" className="h-8 w-8 object-contain" />
          <span>
            PISTA LENTA<span className="text-amber-300">.</span>
          </span>
        </Link>
        <button
          className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-100 transition-colors hover:border-slate-400 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
        >
          <span className="flex items-center gap-2">
            {isLoggingOut && <LoadingSpiral />}
            {isLoggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
          </span>
        </button>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="dashboard-heading">
          <div>
            <span className="text-xs font-bold tracking-[0.18em] text-emerald-800">
              TU PANEL
            </span>
            <h1 className="mt-2 mb-3 font-serif text-4xl leading-tight tracking-tight text-slate-950 sm:text-5xl">
              Hola, {user?.fullName}.
            </h1>
            <p className="max-w-xl leading-relaxed text-slate-600">
              Tu espacio para consultar tu saldo y explorar una muestra de
              estadísticas.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <Card
            className="relative flex min-h-72 flex-col justify-center gap-0 overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-sm"
            role="region"
            aria-label="Saldo actual"
          >
            <img
              src={caracol}
              alt=""
              className="pointer-events-none absolute -right-7 -bottom-10 z-0 h-56 w-56 rotate-[-6deg] object-contain opacity-40 brightness-75 drop-shadow-[0_16px_20px_rgba(0,0,0,0.3)] sm:h-64 sm:w-64"
              aria-hidden="true"
            />
            <Badge
              variant="secondary"
              className="relative z-10 mb-4 border border-emerald-800 bg-blue-950 text-emerald-100"
            >
              SALDO ACTUAL
            </Badge>
            <strong className="relative z-10 text-5xl font-bold tracking-tight break-all sm:text-6xl">
              {currency.format(balance ?? 0)}
            </strong>
            <p className="relative z-10 mt-3 text-sm text-slate-300">
              Disponible en tu cuenta de demostración
            </p>
          </Card>
          <TopUpPanel />
        </div>

        <div className="stats-heading">
          <div>
            <span className="section-kicker">ESTADÍSTICAS DE EJEMPLO</span>
            <h2>Un vistazo a la pista</h2>
          </div>
          <span className="sample-badge">
            Datos simulados · {raceCount} carreras ficticias en un día
          </span>
        </div>
        <div className="chart-grid">
          <section className="chart-card" aria-labelledby="bet-chart-title">
            <div className="chart-card-heading">
              <h3 id="bet-chart-title">Apuestas ganadas y perdidas</h3>
              <span>DEMOSTRACIÓN</span>
            </div>
            <BetResultsChart />
          </section>
          <section className="chart-card" aria-labelledby="snail-chart-title">
            <div className="chart-card-heading">
              <h3 id="snail-chart-title">Victorias de los caracoles</h3>
              <span>DEMOSTRACIÓN</span>
            </div>
            <SnailVictoriesChart />
            <p className="chart-note">
              Una victoria por carrera. Las seis barras suman {raceCount}.
            </p>
          </section>
        </div>
      </main>

      <footer className="flex flex-col justify-between gap-2 bg-slate-900 px-6 py-6 text-xs tracking-wider text-slate-300 sm:flex-row sm:px-[5vw]">
        <span>PISTA LENTA © 2026</span>
        <span>DEMO</span>
      </footer>
    </div>
  );
}
