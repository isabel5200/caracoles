// Un día ficticio: seis carreras y una apuesta simulada por carrera.
// Son resultados de ejemplo, no carreras ejecutadas ni apuestas del usuario.
const races = [
  { winner: "Turbo", betOn: "Turbo" },
  { winner: "Luna", betOn: "Mora" },
  { winner: "Turbo", betOn: "Rayo" },
  { winner: "Mora", betOn: "Mora" },
  { winner: "Sol", betOn: "Luna" },
  { winner: "Rayo", betOn: "Nube" },
] as const;

const snails = [
  { name: "Turbo", color: "#e6996e" },
  { name: "Luna", color: "#9e87c9" },
  { name: "Rayo", color: "#71b99c" },
  { name: "Mora", color: "#dc7fa6" },
  { name: "Sol", color: "#d5aa5c" },
  { name: "Nube", color: "#7eabc0" },
] as const;

export const raceCount = races.length;
export const betSummary = {
  won: races.filter((race) => race.winner === race.betOn).length,
  lost: races.filter((race) => race.winner !== race.betOn).length,
};
export const snailVictories = snails.map((snail) => ({
  ...snail,
  wins: races.filter((race) => race.winner === snail.name).length,
}));
