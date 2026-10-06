# Pista Lenta — Documentación

Repositorio: https://github.com/isabel5200/maria-2939 

## Descripción

Aplicación de demostración con registro, inicio y cierre de sesión, dashboard privado y recargas ficticias. Cada usuario empieza con $0 MXN. El dashboard muestra gráficas de resultados simulados; no hay flujo para apostar ni ejecutar carreras.


## Tecnologías utilizadas
| Tecnología | Uso |
| --- | --- |
| React 19 y React Router 7 | Componentes, estado y navegación del frontend. |
| TypeScript 7 | Tipado en frontend, backend y contratos compartidos. |
| Node.js y Express 5 | API HTTP, middleware y procesamiento de solicitudes. |
| Vite 8 | Servidor de desarrollo y compilación del frontend. |
| Tailwind CSS 4, CSS propio y shadcn/ui | Estilos y componentes de formularios, tarjetas y mensajes. |
| Base UI, class-variance-authority y cn | Primitivas y composición de estilos de los componentes. |
| Chart.js 4 | Gráficas de dona y barras con datos ficticios. |
| bcryptjs y jsonwebtoken | Hash de contraseñas y autenticación mediante JWT. |
| npm Workspaces, tsx, concurrently y Prettier | Organización de paquetes, ejecución en desarrollo y formato. |
| node:test y node:assert/strict | Ejecución de tests y comprobación de resultados. |

- `apps/api/src`: rutas → controladores → servicios → repositorio; middleware verifica JWT y utils agrupa errores y conversiones.
- `apps/web/src`: páginas, componentes, contexto de autenticación, hook useAuth, servicios HTTP, utilidades y estadísticas simuladas.
- `packages/shared`: tipos comunes de usuario, sesión, solicitudes y operaciones.
- `apps/web/src/assets/caracol.png`: imagen del caracol.

LocalStorage guarda la sesión bajo `snailBetSession`: usuario público, JWT, saldo y última operación. El servidor guarda usuarios, hashes y saldo en `apps/api/data/users.json`, excluido de Git. No utiliza una base de datos.

## Flujos y API

Registro valida campos y correo duplicado, genera un hash bcrypt y crea el usuario. Login devuelve usuario, token y saldo. El JWT vence a las dos horas. Al restaurar la sesión se consulta al servidor para actualizar usuario y saldo; logout borra la sesión local.

| Método y ruta | Función |
| --- | --- |
| GET /api/health | Estado de la API. |
| POST /api/auth/register | Registro. |
| POST /api/auth/login | Inicio de sesión. |
| GET /api/auth/me | Usuario y saldo; requiere JWT. |
| POST /api/wallet/top-up | Recarga ficticia; requiere JWT. |

SnailPay acredita solo operaciones aprobadas. El servidor obtiene el pagador desde la cuenta autenticada y calcula el saldo; el valor del navegador es una copia para mostrarlo.

| Escenario | Datos de prueba | Respuesta |
| --- | --- | --- |
| Aprobación | Tarjeta 1234123412341234, vencimiento 12/26, CVV 543 | 200; suma el monto. |
| Rechazo | Tarjeta 0000000000000000, vencimiento 12/26, CVV 000 | 402; conserva el saldo. |
| Datos inválidos o combinación no admitida | Campos o monto inválidos | 422; conserva el saldo. |
| Error simulado | SNAILPAY_MODE=system_error en la API | 503; conserva el saldo. |

## Instalación y scripts npm

Requiere Node.js 22.12 o superior. Desde la raíz, ejecuta `npm ci`, copia `apps/api/.env.example` a `apps/api/.env` y configura `JWT_SECRET` con una cadena aleatoria de al menos 32 caracteres y `PORT=3002`. Después ejecuta `npm run dev`.

Frontend: http://localhost:5173. API: http://localhost:3002/api/health.

### Comandos desde la raíz

| Comando | Qué hace |
| --- | --- |
| npm run dev | Inicia API y frontend a la vez con concurrently. tsx observa cambios del backend y Vite sirve el frontend. |
| npm run build | Compila la API a apps/api/dist y luego verifica tipos y genera apps/web/dist con Vite. Se detiene si falla una etapa. |
| npm run typecheck | Comprueba tipos de API y frontend sin generar archivos. No ejecuta los tests. |
| npm test / npm run test | Comprueba tipos con tsconfig.test.json y, si pasa, ejecuta los dos archivos de tests con node:test y tsx. No requiere levantar las aplicaciones. |
| npm run format | Aplica Prettier y modifica el formato de los archivos incluidos. No es un linter. |
| npm start / npm run start | Ejecuta solo la API compilada, con node dist/index.js. Requiere build previo. |

### Comandos de cada aplicación

Puedes ejecutarlos desde la raíz usando `-w`, que selecciona el workspace:

| Comando | Qué hace |
| --- | --- |
| npm run dev -w @caracoles/api | Inicia únicamente la API en desarrollo. |
| npm run dev -w @caracoles/web | Inicia únicamente Vite para el frontend. |
| npm run build -w @caracoles/api | Compila únicamente el backend. |
| npm run build -w @caracoles/web | Verifica los tipos del frontend y genera su build. |
| npm run typecheck -w @caracoles/api | Verifica únicamente tipos del backend. |
| npm run typecheck -w @caracoles/web | Verifica únicamente tipos del frontend. |
| npm run start -w @caracoles/api | Inicia únicamente el backend compilado. |
| npm run preview -w @caracoles/web | Sirve localmente el frontend compilado para revisarlo; requiere build previo. No inicia la API. |

El proxy `/api` está configurado en el servidor de desarrollo de Vite. Para preview o despliegue se necesita configurar cómo llegará el frontend a la API; `preview` no define ese despliegue. No existe un script `preview` en la raíz.

## Tests implementados

| Archivo y caso | Qué comprueba | Motivo de su elección |
| --- | --- | --- |
| apps/api/test/auth.test.ts — registro correcto | Crea y persiste el usuario; la respuesta no contiene contraseña ni hash. | Cubre la creación de cuenta y la exclusión de datos sensibles. |
| Mismo archivo — correo duplicado | El segundo registro devuelve AppError con 409 y EMAIL_TAKEN. | Cubre una validación importante del registro. |
| Mismo archivo — login válido | Devuelve el usuario, saldo cero y un JWT cuyos datos corresponden a la cuenta. | Cubre el acceso y la emisión de sesión. |
| apps/web/test/storage.test.ts — persistencia de sesión | Guardar y cargar recupera la misma sesión. | Cubre el requisito de conservar datos en LocalStorage. |

Los tests de autenticación usan un archivo temporal distinto por caso y lo eliminan al terminar. El test de almacenamiento usa una implementación de LocalStorage en memoria. Son pruebas de servicios y utilidades: no recorren la interfaz ni los endpoints HTTP. Aún no cubren SnailPay, contraseñas incorrectas ni expiración de sesión.

Se confirmó su implementación leyendo el código; no se certifica aquí que hayan pasado en ejecución.

## Correcciones pendientes: dónde y cómo aplicarlas

Estos cambios son instrucciones; todavía no se han aplicado en GitHub.

### 1. Limpiar la sesión cuando una recarga devuelve 401

En `apps/web/src/context/AuthContext.tsx`, dentro de `topUp`, sustituye la línea que llama a `walletService.topUp` por:

```tsx
let result: SnailPayOperation;
try {
  result = await walletService.topUp(session.token, payment);
} catch (cause) {
  if (
    cause instanceof ApiRequestError &&
    cause.status === 401 &&
    loadSession()?.token === session.token
  ) {
    logout();
  }
  throw cause;
}
```

Mantén el resto de la función. La comparación de tokens evita borrar una sesión nueva si la respuesta pertenece a una anterior. ProtectedRoute redirigirá al login al limpiar la sesión.

### 2. Rechazar una recarga que se redondea a cero centavos

En `apps/api/src/utils/money.ts`, añade `cents <= 0` a la condición de rechazo:

```ts
if (
  cents <= 0 ||
  !Number.isSafeInteger(cents) ||
  Math.abs(cents / 100 - value) > 1e-9
) return null;
```

Así, `toCents(0.0000000001)` se rechaza en lugar de devolver cero.

### 3. Conservar el error 413 para solicitudes demasiado grandes

En `apps/api/src/utils/error-handler.ts`, antes de `console.error(error)`, añade:

```ts
if (
  typeof error === "object" &&
  error !== null &&
  "type" in error &&
  error.type === "entity.too.large"
) {
  response.status(413).json({
    error: {
      code: "PAYLOAD_TOO_LARGE",
      message: "La solicitud supera el tamaño permitido.",
    },
  } satisfies ApiError);
  return;
}
```

Después de aplicar los cambios, ejecuta `npm run typecheck`, `npm test` y `npm run build`. Los cuatro tests actuales no cubren estas correcciones: comprueba además una recarga con token vencido, el monto diminuto y una petición que supere 16 KB.

