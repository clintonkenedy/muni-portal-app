# muni-portal

Self-service portal of the Municipalidad Provincial de Puno (`apps.munipuno.gob.pe`): every
active user signs in and sees the systems they can enter and their profile.

It is a front-end only (Quasar / Vue 3, plain JavaScript). All data comes from the core
(`muni-usuarios`), and login goes through Ory Hydra with `@munipuno/hydra-auth-vue`.

| Page | Route | Core endpoint |
|------|-------|---------------|
| Mis sistemas | `/sistemas` | `GET /api/me/sistemas` |
| Mi perfil | `/perfil` | `GET /api/me/perfil` |
| Cambiar mi clave | `/clave` | `POST /api/me/password` |
| Últimos accesos | `/accesos` | `GET /api/me/accesos` |
| Mis sesiones | `/sesiones` | `GET /api/me/sesiones`, `DELETE /api/me/sesiones` |
| Landing (public, post-logout) | `/` | — |

"Mis sistemas" is a launcher: one tile per sistema, opened in a new tab, with a search over
name, description and roles (press `/` to focus it). The layout follows the core design system
(navy side menu, `muni-usuarios/design/system.md`).

- **Mi perfil** shows the SGD office name of each puesto (`trabajos[].oficina`) when the core
  has it.
- **Cambiar mi clave** checks the form before sending (every field required, new password of
  at least 8 characters, both new passwords equal) and shows the core's field errors under the
  fields. Sessions stay open after the change.
- **Últimos accesos** lists the latest sign-in attempts (date, sistema, IP, browser/OS, success
  or failure) recorded by the IdP.
- **Mis sesiones** lists the sistemas with an open session. "Cerrar todas las sesiones" closes
  them all, including the portal's own session, and lands on `/`.

## Requirements on the core

The portal needs a core that has:

- the `sistemas.acceso_abierto` column and the `/api/me/*` endpoints (run `php artisan migrate`
  after deploying the core);
- automatic trust of registered clients (F7), so the portal token is accepted without editing
  `HYDRA_AUDIENCE`.

## Register the portal in the core (once per environment)

1. **Sistemas → Nuevo**: create the sistema (for example `PORTAL`), active.
2. In its general form turn **"Abierto a todos los usuarios activos"** on. Without it, only
   users attached to the sistema can log in. Leave **"Mostrar en el portal"** off, so the portal
   does not list itself.
3. **Accesos (clients) → Web**: add a client with
   - redirect URI `https://apps.munipuno.gob.pe/oidc-callback`
   - post-logout redirect URI `https://apps.munipuno.gob.pe/`
   - allowed CORS origin ("Orígenes permitidos (CORS)") `https://apps.munipuno.gob.pe`. The
     portal uses `@munipuno/hydra-auth-vue` 0.7.0 with `discovery: false`, so this is all Hydra
     needs: the origin does not have to be in Hydra's global `HYDRA_CORS_ORIGINS`.

   Its client id is `OIDC_CLIENT_ID`.
4. For every sistema that should appear in "Mis sistemas": set **URL** and **Ícono** (an icon
   name such as `mdi-bus`) and turn **"Mostrar en el portal"** on. A sistema without a URL is
   listed but cannot be opened.

A person sees a sistema when it is active, shown in the portal, and either assigned to them or
open to every active user.

## Configuration

Settings are public values compiled into the bundle. Copy `.env.example` to `.env.dev` (used by
`quasar dev`) and `.env.prod` (used by `quasar build`), or pass the same names as environment
variables / Docker build args.

| Variable | Example (production) |
|----------|----------------------|
| `API_CORE_URL` | Core API base URL, no trailing slash, no `/api` |
| `OIDC_AUTHORITY` | Hydra public URL; must match the token `iss` |
| `OIDC_CLIENT_ID` | Web client of the portal sistema |
| `OIDC_REDIRECT_URI` | `https://apps.munipuno.gob.pe/oidc-callback` |
| `OIDC_POST_LOGOUT_REDIRECT_URI` | `https://apps.munipuno.gob.pe/` |
| `OIDC_SCOPE` | `openid profile email offline_access` |

## Development

```bash
npm install
cp .env.example .env.dev   # then fill it in
npm run dev                # http://localhost:9100
```

Register `http://localhost:9100/oidc-callback` and `http://localhost:9100/` on the local portal
client.

```bash
npm test        # unit tests (Vitest)
npm run lint    # ESLint
npm run build   # dist/spa
```

## Deploy (Docker / Dokploy)

```bash
docker build -t muni-portal \
  --build-arg API_CORE_URL=... \
  --build-arg OIDC_AUTHORITY=... \
  --build-arg OIDC_CLIENT_ID=... \
  --build-arg OIDC_REDIRECT_URI=https://apps.munipuno.gob.pe/oidc-callback \
  --build-arg OIDC_POST_LOGOUT_REDIRECT_URI=https://apps.munipuno.gob.pe/ \
  --build-arg OIDC_SCOPE="openid profile email offline_access" .
```

The image serves the SPA with nginx on port 80 (history-mode fallback in `nginx/default.conf`).
Point `apps.munipuno.gob.pe` at it. The values are fixed at build time: changing one needs a
rebuild.

## Troubleshooting

| Symptom | Cause | Check |
|---------|-------|-------|
| Login is rejected for a normal user | The portal sistema is not open | "Abierto a todos los usuarios activos" on the portal sistema |
| Login works, then the callback screen shows an error | The core does not know the client | The Web client is registered under the portal sistema and the sistema is active |
| "Mis sistemas" is empty | Nothing is shown in the portal for that person | "Mostrar en el portal" on the sistema, sistema active, person assigned to it |
| A card cannot be clicked | The sistema has no valid `http(s)` URL | URL in the sistema general form |
