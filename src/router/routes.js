// Every route needs a session unless it is flagged `meta.public`
// (`requireAuthByDefault` in src/boot/hydraAuth.js).
const routes = [
  {
    // Landing: where Hydra sends the browser after logout or an automatic
    // session close, so it must be reachable without a session.
    path: '/',
    name: 'landing',
    component: () => import('pages/LandingPage.vue'),
    meta: { public: true },
  },
  {
    path: '/oidc-login',
    component: () => import('pages/auth/LoginIndex.vue'),
    meta: { public: true },
  },
  {
    path: '/oidc-callback',
    component: () => import('pages/auth/LoginCallback.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('layouts/PortalLayout.vue'),
    children: [
      { path: 'sistemas', name: 'sistemas', component: () => import('pages/MisSistemasPage.vue') },
      { path: 'perfil', name: 'perfil', component: () => import('pages/MiPerfilPage.vue') },
      { path: 'clave', name: 'clave', component: () => import('pages/CambiarClavePage.vue') },
      { path: 'accesos', name: 'accesos', component: () => import('pages/MisAccesosPage.vue') },
      { path: 'sesiones', name: 'sesiones', component: () => import('pages/MisSesionesPage.vue') },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { public: true },
  },
]

export default routes
