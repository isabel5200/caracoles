import { useEffect, useState, type FormEvent } from "react";
import type { RaceResult, Snail } from "@caracoles/shared";
import { getSnails, runRace } from "./api";
import {
  INITIAL_BALANCE,
  loadPlayer,
  savePlayer,
  type Player,
} from "./storage";

const money = (amount: number) => new Intl.NumberFormat("es-MX").format(amount);

export default function App() {
  const [player, setPlayer] = useState<Player | null>(loadPlayer);
  const [name, setName] = useState("");
  const [snails, setSnails] = useState<Snail[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [stake, setStake] = useState(50);
  const [loading, setLoading] = useState(true);
  const [racing, setRacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (player) savePlayer(player);
  }, [player]);

  useEffect(() => {
    getSnails()
      .then((list) => {
        setSnails(list);
        setSelectedId(list[0]?.id ?? "");
        setError("");
      })
      .catch((cause: unknown) =>
        setError(
          cause instanceof Error
            ? cause.message
            : "No se pudieron cargar los caracoles.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  function startSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || cleanName.length > 30) return;
    setPlayer({
      name: cleanName,
      sessionId: crypto.randomUUID(),
      balance: player?.balance ?? INITIAL_BALANCE,
      history: player?.history ?? [],
    });
    setName("");
  }

  async function handleRace() {
    if (!player?.sessionId || racing || !selectedId) return;
    if (
      !Number.isSafeInteger(stake) ||
      stake < 1 ||
      stake > 1000 ||
      stake > player.balance
    ) {
      setError(
        "Ingresa una apuesta entera entre 1 y 1000 que no supere tu saldo.",
      );
      return;
    }
    setRacing(true);
    setError("");
    try {
      const result = await runRace({ snailId: selectedId, stake });
      if (!snails.some((snail) => snail.id === result.winnerSnailId)) {
        throw new Error(
          "La carrera devolvió un ganador desconocido. No se descontó tu apuesta.",
        );
      }
      setPlayer((current) =>
        current
          ? {
              ...current,
              balance: current.balance - result.stake + result.payout,
              history: [result, ...current.history].slice(0, 20),
            }
          : current,
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudo completar la carrera.",
      );
    } finally {
      setRacing(false);
    }
  }

  const latest: RaceResult | undefined = player?.history[0];
  const winnerName =
    snails.find((snail) => snail.id === latest?.winnerSnailId)?.name ??
    "Caracol";
  const active = Boolean(player?.sessionId);

  return (
    <div className="site-shell">
      <header className="topbar">
        <a className="brand" href="#inicio">
          <span className="brand-mark">🐌</span>
          <span>
            PISTA LENTA<span className="brand-dot">.</span>
          </span>
        </a>
        <span className="top-note">
          UN JUEGO DE DEMOSTRACIÓN · SIN DINERO REAL
        </span>
        {active && (
          <div className="top-account">
            <span>Hola, {player?.name}</span>
            <button
              className="text-button"
              onClick={() =>
                setPlayer((current) =>
                  current ? { ...current, sessionId: null } : null,
                )
              }
            >
              Salir
            </button>
          </div>
        )}
      </header>

      <main id="inicio">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" /> LA CARRERA ESTÁ POR EMPEZAR
            </div>
            <h1>
              La velocidad
              <br />
              es <em>relativa.</em>
            </h1>
            <p>
              Elige tu caracol, haz tu apuesta y descubre quién cruza la meta.
              Aquí hasta la paciencia tiene premio.
            </p>
            <div className="hero-meta">
              <span>04 COMPETIDORES</span>
              <span>·</span>
              <span>1 GANADOR</span>
              <span>·</span>
              <span>∞ EMOCIÓN</span>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <span className="orbit orbit-one" />
            <span className="orbit orbit-two" />
            <span className="hero-snail">🐌</span>
            <span className="art-caption">DESPACIO PERO SEGURO</span>
          </div>
        </section>

        {!active ? (
          <section className="welcome panel">
            <div>
              <span className="section-kicker">01 / TU PERFIL</span>
              <h2>Entra a la pista</h2>
              <p>
                Usa un apodo para empezar. Tu sesión, saldo e historial se
                guardan en este navegador.
              </p>
            </div>
            <form onSubmit={startSession} className="welcome-form">
              <label htmlFor="name">TU APODO</label>
              <input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={30}
                placeholder="Ej. Capitán Caracol"
                required
                autoComplete="nickname"
              />
              <button className="primary-button" type="submit">
                Comenzar <span aria-hidden="true">↗</span>
              </button>
              {player && (
                <small>
                  Al volver conservarás tus {money(player.balance)} créditos.
                </small>
              )}
            </form>
          </section>
        ) : (
          <>
            <div className="game-heading">
              <div>
                <span className="section-kicker">02 / ELIGE Y APUESTA</span>
                <h2>Tu próxima carrera</h2>
              </div>
              <div className="balance">
                <span>SALDO DISPONIBLE</span>
                <strong>
                  {money(player?.balance ?? 0)} <small>créditos</small>
                </strong>
              </div>
            </div>
            <div className="game-grid">
              <section
                className="competitors panel"
                aria-labelledby="competitors-title"
              >
                <div className="panel-heading">
                  <h3 id="competitors-title">Elige tu caracol</h3>
                  <span>01 — 04</span>
                </div>
                {loading ? (
                  <p className="muted">Cargando competidores…</p>
                ) : snails.length === 0 ? (
                  <button
                    className="secondary-button"
                    onClick={() => {
                      setLoading(true);
                      getSnails()
                        .then((list) => {
                          setSnails(list);
                          setSelectedId(list[0]?.id ?? "");
                          setError("");
                        })
                        .catch((cause: unknown) =>
                          setError(
                            cause instanceof Error
                              ? cause.message
                              : "No se pudo conectar.",
                          ),
                        )
                        .finally(() => setLoading(false));
                    }}
                  >
                    Reintentar carga
                  </button>
                ) : (
                  <div className="snail-list">
                    {snails.map((snail, index) => (
                      <button
                        key={snail.id}
                        className={`snail-card ${selectedId === snail.id ? "selected" : ""}`}
                        onClick={() => setSelectedId(snail.id)}
                        aria-pressed={selectedId === snail.id}
                        disabled={racing}
                        type="button"
                      >
                        <span className="snail-number">0{index + 1}</span>
                        <span
                          className="snail-avatar"
                          style={{ backgroundColor: snail.color }}
                        >
                          {snail.emoji}
                        </span>
                        <span className="snail-name">
                          {snail.name}
                          <small>COMPETIDOR</small>
                        </span>
                        <span className="radio-indicator" />
                      </button>
                    ))}
                  </div>
                )}
              </section>
              <section className="bet-panel panel" aria-labelledby="bet-title">
                <div className="panel-heading">
                  <h3 id="bet-title">Tu apuesta</h3>
                  <span>CRÉDITOS</span>
                </div>
                <p className="muted">
                  Si tu caracol gana, recibes 3 veces el monto apostado.
                </p>
                <label htmlFor="stake" className="field-label">
                  MONTO
                </label>
                <div className="stake-field">
                  <input
                    id="stake"
                    type="number"
                    min="1"
                    max={Math.min(1000, player?.balance ?? 0)}
                    step="1"
                    value={stake}
                    onChange={(event) => setStake(Number(event.target.value))}
                    disabled={racing || (player?.balance ?? 0) === 0}
                  />
                  <span>CR</span>
                </div>
                <div className="quick-stakes">
                  {[25, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setStake(amount)}
                      disabled={racing || amount > (player?.balance ?? 0)}
                    >
                      +{amount}
                    </button>
                  ))}
                </div>
                <button
                  className="primary-button race-button"
                  type="button"
                  onClick={handleRace}
                  disabled={
                    racing ||
                    loading ||
                    snails.length === 0 ||
                    (player?.balance ?? 0) === 0
                  }
                >
                  {racing ? "Corriendo…" : "Iniciar carrera"}{" "}
                  <span aria-hidden="true">↗</span>
                </button>
                <p className="bet-note">
                  La apuesta se descuenta cuando la carrera termina
                  correctamente.
                </p>
              </section>
            </div>
            {error && (
              <div className="alert" role="alert">
                {error}
              </div>
            )}
            {latest && (
              <section
                className={`result ${latest.payout > 0 ? "win" : "loss"}`}
                aria-live="polite"
              >
                <div>
                  <span className="section-kicker">ÚLTIMO RESULTADO</span>
                  <h3>
                    {latest.payout > 0
                      ? "¡Tu caracol ganó!"
                      : "Esta vez ganó " + winnerName}
                  </h3>
                  <p>
                    Ganador: {winnerName} · Apuesta: {money(latest.stake)}{" "}
                    créditos
                  </p>
                </div>
                <strong>
                  {latest.payout > 0
                    ? `+${money(latest.payout - latest.stake)}`
                    : `−${money(latest.stake)}`}{" "}
                  <small>CR</small>
                </strong>
              </section>
            )}
            <section className="history">
              <div className="history-head">
                <span className="section-kicker">03 / TU RECORRIDO</span>
                <h2>Últimas carreras</h2>
              </div>
              {!player?.history.length ? (
                <p className="muted">
                  Todavía no hay carreras. La primera puede ser la tuya.
                </p>
              ) : (
                <div className="history-list">
                  {player.history.slice(0, 5).map((race) => (
                    <div className="history-row" key={race.id}>
                      <span>
                        {new Date(race.createdAt).toLocaleDateString("es-MX")}
                      </span>
                      <strong>
                        {snails.find(
                          (snail) => snail.id === race.selectedSnailId,
                        )?.name ?? race.selectedSnailId}
                      </strong>
                      <span>{race.payout > 0 ? "Ganó" : "Perdió"}</span>
                      <b className={race.payout > 0 ? "positive" : "negative"}>
                        {race.payout > 0 ? "+" : "−"}
                        {money(
                          race.payout > 0
                            ? race.payout - race.stake
                            : race.stake,
                        )}{" "}
                        CR
                      </b>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
      <footer>
        <span>PISTA LENTA © 2026</span>
        <span>Una demo para practicar React + Express + TypeScript</span>
      </footer>
    </div>
  );
}
