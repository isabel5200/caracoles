// Da tiempo a percibir el estado de carga cuando la API local responde enseguida.
export function waitForLoadingCue(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 650));
}
