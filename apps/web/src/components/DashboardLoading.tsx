import { LoadingSpiral } from "./LoadingSpiral";
import caracol from "../assets/caracol.png";

export function DashboardLoading() {
  return (
    <div
      className="flex min-h-screen flex-col bg-slate-100 text-slate-900"
      role="status"
      aria-live="polite"
    >
      <header className="flex min-h-20 items-center bg-slate-900 px-6 py-4 text-white sm:px-[5vw]">
        <span className="flex items-center gap-2 text-lg font-black tracking-widest">
          <img
            src={caracol}
            alt=""
            className="h-8 w-8 object-contain"
          />
          PISTA LENTA
        </span>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
        <div className="overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-sm sm:p-10">
          <div className="flex items-center gap-3 text-sm font-bold tracking-[0.16em] text-emerald-200">
            <LoadingSpiral />
            TU PANEL
          </div>
          <h1 className="mt-6 font-serif text-3xl tracking-tight sm:text-4xl">
            Preparando la pista…
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
            Cargando tu saldo y las estadísticas de demostración.
          </p>
          <div className="mt-8 h-1.5 max-w-sm overflow-hidden rounded-full bg-slate-700">
            <div className="dashboard-loading-progress h-full w-2/5 rounded-full bg-amber-300 motion-reduce:animate-none" />
          </div>
        </div>

        <div
          className="mt-6 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]"
          aria-hidden="true"
        >
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none" />
        </div>
      </main>
    </div>
  );
}
