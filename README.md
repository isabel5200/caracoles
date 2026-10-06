# Pista Lenta · módulo de autenticación

Base Full-Stack con React, Express y TypeScript estricto. Esta etapa implementa registro, inicio de sesión, persistencia local, ruta privada y cierre de sesión. El dashboard solo muestra el perfil y los 1000 créditos iniciales; las apuestas y carreras quedan fuera de esta etapa.

## Ejecutar

Requiere Node.js 22.12 o superior y npm. Desde la raíz del proyecto:

```bash
npm install
```

Copia `apps/api/.env.example` a `apps/api/.env` y configura `JWT_SECRET` con una cadena aleatoria de al menos 32 caracteres. Puedes generar una con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.

```bash
npm run dev
```

Web: <http://localhost:5173> · API: <http://localhost:3001/api/health>

También están disponibles `npm run typecheck`, `npm run build` y `npm run format`. No hay un comando de lint configurado en esta base.

## Estructura

```text
apps/api/src/routes/          Endpoints HTTP
apps/api/src/controllers/     Entrada y salida de las peticiones
apps/api/src/services/        Validación y reglas de autenticación
apps/api/src/repositories/    Usuarios en archivo JSON
apps/api/src/middleware/      Verificación de JWT
apps/web/src/pages/           Registro, login y dashboard
apps/web/src/context/         Estado de autenticación
apps/web/src/services/        Llamadas HTTP y errores
apps/web/src/utils/           Acceso a LocalStorage
packages/shared/             Contratos TypeScript compartidos
```

## Flujo

1. `POST /api/auth/register` valida los datos, comprueba correo duplicado y guarda el hash bcrypt de la contraseña. Responde `{ user }`, sin contraseña.
2. `POST /api/auth/login` comprueba credenciales y devuelve `{ user, token, balance }`. El JWT contiene `sub` y `email`, y expira a las 2 horas.
3. `AuthContext` guarda la respuesta en LocalStorage con la clave `snailBetSession`. Al recargar, recupera la sesión y consulta `GET /api/auth/me` con `Authorization: Bearer TOKEN`.
4. `ProtectedRoute` permite el dashboard cuando hay sesión y redirige a `/login` cuando no la hay. Logout borra la sesión local y redirige a `/login`.

## Persistencia y seguridad

Sin base de datos, el repositorio escribe usuarios en `apps/api/data/users.json`, creado automáticamente y excluido de Git. Los usuarios sobreviven a reinicios del servidor. El archivo contiene `passwordHash`, nunca contraseñas en texto plano. `apps/api/.env` también está excluido de Git.

LocalStorage conserva únicamente usuario público, JWT y saldo. Se usa aquí por requisito de la evaluación. En producción se evaluaría guardar el token en una cookie `HttpOnly` y `Secure` para reducir su exposición ante XSS. El saldo inicial se guarda también en el repositorio del servidor; el saldo de LocalStorage es una copia para la interfaz, no una fuente segura para operaciones financieras.

El logout elimina el token del navegador. Como JWT es sin estado, un token copiado antes del logout seguiría válido hasta expirar; la revocación de tokens requeriría infraestructura adicional.

## Respuestas principales

| Caso                            | Estado | Respuesta                                   |
| ------------------------------- | ------ | ------------------------------------------- |
| Registro correcto               | 201    | `{ "user": { "id", "fullName", "email" } }` |
| Campos inválidos                | 400    | `error.message` y `error.fields`            |
| Correo duplicado                | 409    | `EMAIL_TAKEN`                               |
| Credenciales incorrectas        | 401    | `INVALID_CREDENTIALS`                       |
| JWT ausente, inválido o vencido | 401    | `TOKEN_REQUIRED` o `INVALID_TOKEN`          |

Para producción faltarían controles como límites de intentos, gestión de recuperación de contraseña y una base de datos con acceso concurrente. No forman parte de esta prueba base.
