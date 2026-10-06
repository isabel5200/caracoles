import { useEffect, useRef } from "react";
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  LinearScale,
  Tooltip,
} from "chart.js";
import { betSummary, snailVictories } from "../mock/dashboardStats";

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  LinearScale,
  Tooltip,
);

function chartAnimation() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? false
    : { duration: 600 };
}

export function BetResultsChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const total = betSummary.won + betSummary.lost;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const chart = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ["Ganadas", "Perdidas"],
        datasets: [
          {
            data: [betSummary.won, betSummary.lost],
            backgroundColor: ["#418a6a", "#e6a07a"],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        animation: chartAnimation(),
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed}`,
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, []);

  return (
    <div className="donut-layout">
      <div className="relative aspect-square w-[190px] max-w-full shrink-0">
        <div className="relative aspect-square w-full">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`${betSummary.won} apuestas ganadas y ${betSummary.lost} perdidas, datos simulados`}
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
          aria-hidden="true"
        >
          <strong className="text-[39px] leading-none">{total}</strong>
          <small className="mt-1 text-[9px] font-extrabold tracking-[0.15em] text-slate-500">
            APUESTAS
          </small>
        </div>
      </div>
      <div className="chart-legend">
        <div>
          <i className="legend-dot won" />
          <span>Ganadas</span>
          <strong>{betSummary.won}</strong>
        </div>
        <div>
          <i className="legend-dot lost" />
          <span>Perdidas</span>
          <strong>{betSummary.lost}</strong>
        </div>
      </div>
    </div>
  );
}

export function SnailVictoriesChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const chart = new Chart(canvas, {
      type: "bar",
      data: {
        labels: snailVictories.map((snail) => snail.name),
        datasets: [
          {
            label: "Victorias",
            data: snailVictories.map((snail) => snail.wins),
            backgroundColor: snailVictories.map((snail) => snail.color),
            borderRadius: 8,
            barThickness: 17,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        animation: chartAnimation(),
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.parsed.x} ${context.parsed.x === 1 ? "victoria" : "victorias"}`,
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            suggestedMax: 3,
            ticks: { stepSize: 1, precision: 0, color: "#71817a" },
            grid: { color: "#e8ece5" },
            border: { display: false },
          },
          y: {
            ticks: { color: "#33463d", font: { weight: "bold" } },
            grid: { display: false },
            border: { display: false },
          },
        },
      },
    });

    return () => chart.destroy();
  }, []);

  return (
    <div className="relative mt-5 h-[260px] w-full">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Victorias simuladas: ${snailVictories.map((snail) => `${snail.name} ${snail.wins}`).join(", ")}`}
      />
    </div>
  );
}
