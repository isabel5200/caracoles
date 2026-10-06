import { randomInt, randomUUID } from "node:crypto";
import express from "express";
import type {
  ApiError,
  RaceRequest,
  RaceResult,
  Snail,
} from "@caracoles/shared";

const app = express();
const port = Number(process.env.PORT) || 3001;

const snails: Snail[] = [
  { id: "turbo", name: "Turbo", color: "#e88c5b", emoji: "🐌" },
  { id: "luna", name: "Luna", color: "#9f8ad0", emoji: "🐌" },
  { id: "rayo", name: "Rayo", color: "#71b99c", emoji: "🐌" },
  { id: "mora", name: "Mora", color: "#dc7fa6", emoji: "🐌" },
];

app.use(express.json({ limit: "16kb" }));

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/api/snails", (_request, response) => {
  response.json(snails);
});

app.post("/api/races", (request, response) => {
  // Cambia esta variable para ensayar las respuestas de una integración externa.
  if (process.env.RACE_MOCK_MODE === "unavailable") {
    response
      .status(503)
      .json({
        error: {
          code: "RACE_UNAVAILABLE",
          message: "La carrera no está disponible. Intenta de nuevo.",
        },
      } satisfies ApiError);
    return;
  }
  if (process.env.RACE_MOCK_MODE === "invalid") {
    response.json({ unexpected: true });
    return;
  }

  const body = request.body as Partial<RaceRequest> | undefined;
  const snailId = body?.snailId;
  const stake = body?.stake;
  if (
    typeof snailId !== "string" ||
    !snails.some((snail) => snail.id === snailId)
  ) {
    response
      .status(400)
      .json({
        error: { code: "INVALID_SNAIL", message: "Elige un caracol válido." },
      } satisfies ApiError);
    return;
  }
  if (
    typeof stake !== "number" ||
    !Number.isSafeInteger(stake) ||
    stake < 1 ||
    stake > 1000
  ) {
    response
      .status(400)
      .json({
        error: {
          code: "INVALID_STAKE",
          message: "La apuesta debe ser un entero entre 1 y 1000.",
        },
      } satisfies ApiError);
    return;
  }

  const winner = snails[randomInt(snails.length)];
  if (!winner) {
    response
      .status(500)
      .json({
        error: {
          code: "NO_SNAILS",
          message: "No hay competidores disponibles.",
        },
      } satisfies ApiError);
    return;
  }
  const result: RaceResult = {
    id: randomUUID(),
    selectedSnailId: snailId,
    winnerSnailId: winner.id,
    stake,
    payout: winner.id === snailId ? stake * 3 : 0,
    createdAt: new Date().toISOString(),
  };
  response.json(result);
});

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof SyntaxError && "body" in error) {
      response
        .status(400)
        .json({
          error: {
            code: "INVALID_JSON",
            message: "El JSON enviado no es válido.",
          },
        } satisfies ApiError);
      return;
    }
    console.error(error);
    response
      .status(500)
      .json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Ocurrió un error inesperado.",
        },
      } satisfies ApiError);
  },
);

app.listen(port, () => {
  console.log(`API lista en http://localhost:${port}`);
});
