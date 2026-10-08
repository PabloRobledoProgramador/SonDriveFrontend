# SonDrive — Frontend

Sitio web de SonDrive (viajes compartidos intermunicipales alrededor de Sonsón). React 19 +
TypeScript + Vite + Tailwind CSS 4. Consume la API de `SonDriveBackend`.

## Requisitos

- Node.js 22 o superior.
- La API corriendo (`dotnet run --project API` en `SonDriveBackend`, en `http://localhost:5064`)
  para usar el sitio; **no** hace falta para las pruebas.

## Todo con Docker (base de datos + API + frontend)

Con los dos repositorios clonados uno al lado del otro (`SonDriveBackend` y `SonDriveFrontend`):

```bash
cd ../SonDriveBackend
cp .env.example .env          # una sola vez: pon tu propia SQL_CLAVE_SA
docker compose up --build     # http://localhost:5173 (frontend) y http://localhost:5064/swagger (API)
```

El frontend corre con recarga en caliente sobre el código de este repositorio. Si cambias
`package.json`, vuelve a levantarlo con `docker compose up --build -V`. Detalles en
`SonDriveBackend/CLAUDE.md` (sección Docker).

## Configuración

Copia `.env.example` como `.env.development` (ya viene uno para desarrollo) y ajusta:

```text
VITE_URL_API=http://localhost:5064
```

Si falta `VITE_URL_API`, el sitio muestra un error claro al hacer la primera solicitud.

## Comandos

```bash
npm install        # dependencias
npm run dev        # servidor de desarrollo en http://localhost:5173
npm run build      # verificación de tipos + compilación de producción
npm run lint       # reglas de ESLint (incluye las de React Hooks y React Refresh)
npm run test       # pruebas con Vitest (jsdom + Testing Library + MSW), sin red ni API real
```

Antes de cerrar una tarea deben pasar `build`, `lint` y `test` (definición de terminado de la
constitución del proyecto).

## Estructura (por funcionalidades)

```text
src/
├─ app/               enrutador, proveedores, diseño principal, secciones (rutas + navegación)
├─ components/
│  ├─ ui/             piezas visuales comunes: Boton, Tarjeta, CampoFormulario, Aviso, Modal, Estados…
│  └─ layout/         Encabezado, NavegacionPrincipal, AccionSesion
├─ features/
│  └─ <funcionalidad>/   paginas/, componentes/, api.ts, consultas.ts, esquemas.ts, tipos.ts, index.ts
├─ lib/               clienteHttp (token + errores ProblemDetails), configuración, errores
└─ pruebas/           configuración de Vitest, servidor MSW, renderizarConApp
```

Reglas principales:

- Una funcionalidad solo importa de otra a través de su `index.ts`; `components/ui` y `lib/` no
  importan de `features/`.
- Ningún componente llama `fetch`: los datos pasan por `consultas.ts` (TanStack Query) → `api.ts`
  → `lib/clienteHttp`.
- La sesión se lee y escribe solo en `features/autenticacion/sesion.ts`.
- Cada sección nueva se registra en `src/app/secciones.ts` con su acceso (`publico`,
  `soloVisitantes` o roles) y si aparece en la navegación.
- Solo se usan los colores y fuentes de `@theme` en `src/index.css`; diseño desde el celular
  (revisar a 320, 360, 768 y 1280 px).
- Las pruebas viven junto al archivo probado (`Nombre.test.tsx`).
