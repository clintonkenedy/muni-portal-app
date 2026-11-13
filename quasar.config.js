// Configuration for the Quasar app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app/wrappers'

// Public settings compiled into the bundle. Values come from `.env`,
// `.env.dev` / `.env.prod` (loaded by Quasar) or, when those files are absent
// (Docker/Dokploy build args), from the real environment.
const ENV_KEYS = [
  'API_CORE_URL',
  'OIDC_AUTHORITY',
  'OIDC_CLIENT_ID',
  'OIDC_REDIRECT_URI',
  'OIDC_POST_LOGOUT_REDIRECT_URI',
  'OIDC_SCOPE',
]

const envFromProcess = Object.fromEntries(
  ENV_KEYS.filter((key) => process.env[key]).map((key) => [key, process.env[key]]),
)

export default defineConfig(() => {
  return {
    boot: ['axios', 'hydraAuth'],

    css: ['app.scss'],

    // Sistema icons come from the core as icon names (e.g. `mdi-bus`).
    // ionicons-v4: `ion-ios-power` on the logout button, as in the GTSV menu.
    extras: ['mdi-v7', 'bootstrap-icons', 'roboto-font', 'material-icons', 'ionicons-v4'],

    build: {
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },
      vueRouterMode: 'history',
      env: envFromProcess,
    },

    devServer: {
      port: 9100,
      open: false,
    },

    framework: {
      config: {},
      lang: 'es',
      plugins: ['Notify'],
    },

    animations: [],
  }
})
