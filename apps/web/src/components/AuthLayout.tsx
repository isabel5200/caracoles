import { Link } from "react-router";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import caracol from "../assets/caracol.png";

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
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex min-h-20 items-center justify-between gap-4 border-b border-white/10 bg-slate-900 px-6 py-4 sm:px-[5vw]">
        <Link
          className="flex items-center gap-2 text-lg font-black tracking-widest text-white transition-colors hover:text-emerald-200 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300"
          to="/"
        >
          <img
            src={caracol}
            alt=""
            className="h-15 w-15 object-contain"
          />
          <span>
            PISTA LENTA
          </span>
        </Link>
        <span className="hidden text-xs font-bold tracking-widest text-slate-300 sm:block">
          DEMO
        </span>
      </header>
      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 py-12 lg:grid-cols-[1fr_460px] lg:gap-16">
        <div>
          <span className="text-xs font-bold tracking-[0.18em] text-amber-300">
            {eyebrow}
          </span>
          <h1 className="mt-5 mb-5 font-serif text-5xl leading-tight tracking-tight text-white sm:text-6xl">
            {title}
          </h1>
          <p className="max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
            {description}
          </p>
          <div
            className="mt-8 hidden text-8xl drop-shadow-lg lg:block"
            aria-hidden="true"
          >
            <img
              src={caracol}
              alt=""
              className="h-50 w-50 object-contain"
            />
          </div>
        </div>
        <Card className="mx-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white py-6 text-slate-900 shadow-xl shadow-black/20 sm:py-9 lg:max-w-none">
          {children}
        </Card>
      </main>
      <footer className="flex flex-col justify-between gap-2 border-t border-white/10 bg-slate-900 px-6 py-6 text-xs tracking-wider text-slate-300 sm:flex-row sm:px-[5vw]">
        <span>PISTA LENTA © 2026</span>
        <span>DEMO</span>
      </footer>
    </div>
  );
}
