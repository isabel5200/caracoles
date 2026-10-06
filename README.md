# Pista Lenta · dashboard y autenticación

Base Full-Stack con React, Express y TypeScript estricto. Incluye registro, inicio de sesión, persistencia local, dashboard privado y cierre de sesión. Cada usuario nuevo empieza con **$0**. Las gráficas usan datos fijos de demostración: no hay flujo para apostar ni lógica que ejecute carreras.

La interfaz usa Tailwind CSS v4 mediante `@tailwindcss/vite`. El plugin se agrega junto a React en `apps/web/vite.config.ts` y el CSS global importa `tailwindcss` desde `apps/web/src/styles.css`; no hace falta un archivo de configuración adicional para estos estilos. Chart.js dibuja las gráficas; el CSS propio mantiene su disposición, leyenda y el formulario de SnailPay.

shadcn/ui se inicializó en `apps/web`: `components.json` apunta al CSS global y el alias `@/` resuelve a `apps/web/src` tanto en Vite como en TypeScript. Se agregaron únicamente Button, Input, Label, Card, Alert y Badge bajo `src/components/ui/`. Login y registro usan estos componentes sin cambiar sus validaciones; el saldo usa Card y Badge. Como el proyecto usa TypeScript 7, el alias en `tsconfig.json` usa `paths` sin `baseUrl`.

## Ejecutar

Requiere Node.js 22.12 o superior y npm. Desde la raíz del proyecto:

```bash
npm install
```

Copia `apps/api/.env.example` a `apps/api/.env` y configura `JWT_SECRET` con una cadena aleatoria de al menos 32 caracteres. Puedes generar una con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

```bash
npm run dev
```

Web: <http://localhost:5173> · API: <http://localhost:3002/api/health>

Si el puerto 3001 aún está ocupado por una versión anterior de la API, esta configuración usa 3002 para evitar que Vite envíe las recargas a la instancia antigua (que responde 404 a `/api/wallet/top-up`). Reinicia el frontend para que cargue el proxy actualizado. Si ya tienes `apps/api/.env`, configura allí `PORT=3002`.

Para comprobar Tailwind manualmente, abre <http://localhost:5173/login>: el fondo oscuro (`bg-slate-950`), la tarjeta blanca y los estados de foco y hover del encabezado vienen de sus clases. Entra al dashboard para ver la tarjeta de saldo `bg-slate-900`. El build de Vite también debe incluir esas utilidades en el CSS generado.

Para comprobar shadcn/ui, envía el formulario de login vacío: verás un Alert. Los campos son Input con Label y el botón de envío es Button; en el dashboard el saldo aparece dentro de Card con Badge.

También están disponibles `npm run typecheck`, `npm run build` y `npm run format`. No hay un comando de lint configurado en esta base.

## Estructura

```text
apps/api/src/routes/          Endpoints HTTP
apps/api/src/controllers/     Entrada y salida de las peticiones
apps/api/src/services/        Validación y reglas de autenticación
apps/api/src/repositories/    Usuarios en archivo JSON
apps/api/src/middleware/      Verificación de JWT
apps/web/src/pages/           Registro, login y dashboard
apps/web/src/components/ui/  Componentes shadcn/ui seleccionados
apps/web/src/context/         Estado de autenticación
apps/web/src/services/        Llamadas HTTP y errores
apps/web/src/mock/            Estadísticas ficticias para las gráficas
apps/web/src/utils/           Acceso a LocalStorage
packages/shared/             Contratos TypeScript compartidos
```

## Flujo

1. `POST /api/auth/register` valida los datos, comprueba correo duplicado y guarda el hash bcrypt de la contraseña. Responde `{ user }`, sin contraseña.
2. `POST /api/auth/login` comprueba credenciales y devuelve `{ user, token, balance }`. El JWT contiene `sub` y `email`, y expira a las 2 horas.
3. `AuthContext` guarda la respuesta en LocalStorage con la clave `snailBetSession`. Al recargar, recupera la sesión y consulta `GET /api/auth/me` con `Authorization: Bearer TOKEN`.
4. `ProtectedRoute` permite el dashboard cuando hay sesión y redirige a `/login` cuando no la hay. Logout borra la sesión local y redirige a `/login`.
5. `POST /api/wallet/top-up` recibe datos **exclusivamente ficticios** y un monto positivo con hasta dos decimales. La API obtiene el identificador y correo del usuario desde el JWT, invoca el mock SnailPay y acredita el saldo únicamente si devuelve `approved`. `AuthContext` guarda el nuevo saldo y la última operación en `snailBetSession`.

El dashboard muestra nombre, saldo, donut de apuestas ganadas/perdidas y barras de victorias por caracol. Chart.js renderiza ambos canvas y libera sus instancias al desmontar los componentes de React. `apps/web/src/mock/dashboardStats.ts` define **seis carreras ficticias en un día**, con seis caracoles y un ganador por carrera. Los seis resultados producen Turbo 2, Luna 1, Rayo 1, Mora 1, Sol 1 y Nube 0 victorias. Hay una apuesta ficticia por carrera: 2 ganadas y 4 perdidas. Ambas gráficas se calculan de esos mismos resultados y no representan apuestas del usuario.

## SnailPay simulado

Requiere `Authorization: Bearer TOKEN` en `POST /api/wallet/top-up`. Ejemplo de cuerpo:

```json
{
  "card_number": "1234123412341234",
  "expiration_date": "12/26",
  "cvv": "543",
  "full_name": "Isabel Lovera",
  "transaction_amount": 125.5
}
```

El nombre puede ser cualquier texto no vacío; el monto puede ser cualquier número positivo con hasta dos decimales. El correo e identificador del pagador **no** se aceptan del cuerpo: se obtienen de la sesión autenticada.

| Datos ficticios                                            | HTTP | `status`   | `status_detail`         | Efecto                 |
| ---------------------------------------------------------- | ---: | ---------- | ----------------------- | ---------------------- |
| Tarjeta `1234123412341234`, vencimiento `12/26`, CVV `543` |  200 | `approved` | `accredited`            | Suma el monto al saldo |
| Tarjeta `0000000000000000`, vencimiento `12/26`, CVV `000` |  402 | `rejected` | `card_declined`         | Ninguno                |
| Campos faltantes, vencimiento distinto o monto no válido   |  422 | `rejected` | `invalid_payment_data`  | Ninguno                |
| Otra combinación de tarjeta/CVV                            |  422 | `rejected` | `unsupported_test_card` | Ninguno                |
| Saldo fuera del límite numérico seguro                     |  422 | `rejected` | `balance_limit`         | Ninguno                |
| API iniciada con `SNAILPAY_MODE=system_error`              |  503 | `error`    | `gateway_unavailable`   | Ninguno                |

Para simular un error interno, agrega `SNAILPAY_MODE=system_error` a `apps/api/.env` y reinicia la API. El mock responderá 503 a todas las solicitudes de recarga y no acreditará ninguna. Quita esa variable y reinicia para volver al modo normal.

Cada respuesta de operación, incluso las rechazadas y las de error interno, contiene `id` (UUID), `status`, `status_detail`, `transaction_amount` (MXN), `date_created` (ISO 8601), `authorization_code` (cadena solo si se aprueba; `null` de otro modo), `reference` (`SNP-` más ocho caracteres), `payer_id`, `payer_email`, `card_number` y `cvv`. Una aprobación incluye además `balance`. Estos dos últimos campos contienen **solo datos ficticios**: si se ingresa una tarjeta o CVV desconocidos, la respuesta usa los valores ficticios `0000000000000000` y `000` respectivamente, sin reflejar ni almacenar el dato recibido. El servidor no conserva números de tarjeta ni CVV; el navegador guarda los de la **última respuesta** en `snailBetSession.lastPayment`, tal como requiere esta prueba. Nunca ingreses datos financieros reales.

## Persistencia y seguridad

Sin base de datos, el repositorio escribe usuarios en `apps/api/data/users.json`, creado automáticamente y excluido de Git. Los usuarios sobreviven a reinicios del servidor. El archivo contiene `passwordHash`, nunca contraseñas en texto plano. `apps/api/.env` también está excluido de Git.

Para pruebas aisladas se puede definir `USERS_FILE` con la ruta de otro archivo JSON, sin tocar los usuarios locales.

LocalStorage conserva usuario público, JWT, saldo y última operación de SnailPay con sus valores **ficticios** de tarjeta y CVV. Se usa aquí por requisito de la evaluación. En producción se evaluaría guardar el token en una cookie `HttpOnly` y `Secure` para reducir su exposición ante XSS; tampoco se guardarían números de tarjeta ni CVV en LocalStorage. El saldo, inicialmente $0, se guarda también en el repositorio del servidor; el saldo de LocalStorage es una copia para la interfaz, no una fuente segura para operaciones financieras.

SnailPay no mueve dinero real ni se conecta a servicios externos.

El logout elimina el token del navegador. Como JWT es sin estado, un token copiado antes del logout seguiría válido hasta expirar; la revocación de tokens requeriría infraestructura adicional.

## Respuestas principales

| Caso                            | Estado  | Respuesta                                     |
| ------------------------------- | ------- | --------------------------------------------- |
| Registro correcto               | 201     | `{ "user": { "id", "fullName", "email" } }`   |
| Campos inválidos                | 400     | `error.message` y `error.fields`              |
| Correo duplicado                | 409     | `EMAIL_TAKEN`                                 |
| Credenciales incorrectas        | 401     | `INVALID_CREDENTIALS`                         |
| JWT ausente, inválido o vencido | 401     | `TOKEN_REQUIRED` o `INVALID_TOKEN`            |
| Operación SnailPay aprobada     | 200     | Objeto de operación con `balance` actualizado |
| Operación SnailPay rechazada    | 402/422 | Objeto de operación; saldo sin cambios        |
| Error interno simulado          | 503     | Objeto de operación; saldo sin cambios        |

Para producción faltarían controles como límites de intentos, gestión de recuperación de contraseña y una base de datos con acceso concurrente. No forman parte de esta prueba base.
