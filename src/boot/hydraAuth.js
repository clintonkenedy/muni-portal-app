import { defineBoot } from '#q-app/wrappers'
import { createHydraAuth } from '@munipuno/hydra-auth-vue'
import { apiCore } from 'src/boot/axios'

// Single shared Hydra/OIDC plugin instance for the whole app.
export const hydraAuth = createHydraAuth({
  authority: process.env.OIDC_AUTHORITY,
  clientId: process.env.OIDC_CLIENT_ID,
  redirectUri: process.env.OIDC_REDIRECT_URI,
  postLogoutRedirectUri: process.env.OIDC_POST_LOGOUT_REDIRECT_URI,
  scope: process.env.OIDC_SCOPE,
  coreApiUrl: process.env.API_CORE_URL,
  // Everything needs a session except routes flagged `meta.public`.
  requireAuthByDefault: true,
  // No discovery: the browser never asks Hydra for its configuration, so the Web
  // client's "Orígenes permitidos (CORS)" in the core is enough (no HYDRA_CORS_ORIGINS).
  discovery: false,
  branding: {
    logo: '/inicio_login.jpg',
    title: 'Portal de Sistemas - Municipalidad de Puno',
  },
})

export default defineBoot(({ app, router }) => {
  app.use(hydraAuth)
  hydraAuth.attach(apiCore)
  router.beforeEach(hydraAuth.guard())
})
