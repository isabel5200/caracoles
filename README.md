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

## Tests implementados

| Archivo y caso | Qué comprueba | Motivo de su elección |
| --- | --- | --- |
| apps/api/test/auth.test.ts — registro correcto | Crea y persiste el usuario; la respuesta no contiene contraseña ni hash. | Cubre la creación de cuenta y la exclusión de datos sensibles. |
| Mismo archivo — correo duplicado | El segundo registro devuelve AppError con 409 y EMAIL_TAKEN. | Cubre una validación importante del registro. |
| Mismo archivo — login válido | Devuelve el usuario, saldo cero y un JWT cuyos datos corresponden a la cuenta. | Cubre el acceso y la emisión de sesión. |
| apps/web/test/storage.test.ts — persistencia de sesión | Guardar y cargar recupera la misma sesión. | Cubre el requisito de conservar datos en LocalStorage. |

Los tests de autenticación usan un archivo temporal distinto por caso y lo eliminan al terminar. El test de almacenamiento usa una implementación de LocalStorage en memoria. 

Se confirmó su implementación leyendo el código y se ejecutaron npm test. Todos los tests pasaron.

