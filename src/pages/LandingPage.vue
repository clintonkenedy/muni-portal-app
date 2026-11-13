<template>
  <div class="landing">
    <header class="landing__brand">
      <span class="landing__escudo">
        <img
          src="/escudo-mpp.jpg"
          alt="Escudo de la Municipalidad Provincial de Puno"
          width="76"
          height="76"
        />
      </span>
      <div>
        <strong class="landing__brand-name">Portal de Sistemas</strong>
        <p class="landing__brand-org">Municipalidad Provincial de Puno</p>
      </div>
    </header>

    <main class="landing__action">
      <div class="landing__inner">
        <!-- Explains an automatic session close (?session_closed=idle|max). The
             library owns its logic and texts; the wrapper only restyles it. -->
        <div class="landing__notice">
          <HydraSessionClosedNotice />
        </div>

        <p class="landing__eyebrow">Personal municipal</p>
        <h1 class="landing__title">Ingresá al portal</h1>
        <p class="landing__lead">
          Ingresá para ver los sistemas a los que tenés acceso y tu perfil.
        </p>
        <!-- The route guard on /sistemas starts the login. -->
        <q-btn unelevated no-caps color="primary" to="/sistemas" class="landing__btn full-width">
          <LineIcon name="log-in" :size="20" />
          <span>Ingresar</span>
        </q-btn>
        <p class="landing__sso">
          <LineIcon name="shield-check" :size="16" />
          <span>
            Te llevamos al acceso único de la municipalidad. Ahí ingresás con tu cuenta municipal y
            volvés acá.
          </span>
        </p>
      </div>
    </main>

    <aside class="landing__panel" aria-label="Sobre el portal">
      <svg class="landing__deco" viewBox="0 0 680 680" aria-hidden="true" focusable="false">
        <circle class="landing__deco-1" cx="340" cy="340" r="340" />
        <circle class="landing__deco-2" cx="340" cy="340" r="250" />
        <circle class="landing__deco-3" cx="340" cy="340" r="160" />
        <circle class="landing__deco-ring" cx="340" cy="340" r="295" />
        <circle class="landing__deco-ring" cx="340" cy="340" r="205" />
      </svg>
      <div class="landing__copy">
        <p class="landing__statement">Tus sistemas municipales, en un solo lugar</p>
        <p class="landing__support">
          Entrás con tu cuenta municipal y encontrás todos los sistemas a los que tenés acceso.
        </p>
      </div>
      <p class="landing__inst">Uso exclusivo del personal de la Municipalidad Provincial de Puno</p>
    </aside>

    <footer class="landing__footer">Municipalidad Provincial de Puno · Portal de Sistemas</footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { HydraSessionClosedNotice, useHydraAuth } from '@munipuno/hydra-auth-vue'
import LineIcon from 'components/LineIcon.vue'

// The Pinia store (plain reactive state). `useAuth()` returns refs, so its
// `user` is always truthy as an object.
const auth = useHydraAuth()
const router = useRouter()

// A signed-in person lands here right after login (the callback goes to `/`).
onMounted(() => {
  if (auth.user) router.replace('/sistemas')
})
</script>

<style lang="scss" scoped>
// Tokens from the core design system (muni-usuarios/design/system.md), as in app.scss.
$menu-active: #0088cc;
$layout-light: #fafafa;
$text-subtitle: #646464;
$radius: 10px;
$on-navy-muted: rgba(255, 255, 255, 0.85);

// Desktop: navy column (brand + panel) | light column (action + footer).
.landing {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 6fr);
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    'brand action'
    'panel action'
    'panel footer';
  background: $layout-light;
  color: #000;
}

.landing__brand,
.landing__panel {
  background: $primary;
  color: #fff;
  padding-left: 96px;
  padding-right: 72px;
}

.landing__brand {
  grid-area: brand;
  padding-top: 72px;
  display: flex;
  align-items: center;
  gap: 20px;

  :focus-visible {
    outline-color: #fff;
  }
}

.landing__escudo {
  flex: none;
  width: 88px;
  height: 88px;
  padding: 6px;
  border-radius: $radius;
  background: #fff;

  img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 6px;
  }
}

.landing__brand-name {
  display: block;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.landing__brand-org {
  margin: 0;
  font-size: 14px;
  color: $on-navy-muted;
}

.landing__panel {
  grid-area: panel;
  position: relative;
  overflow: hidden;
  padding-top: 56px;
  padding-bottom: 56px;
  display: flex;
  flex-direction: column;
}

.landing__deco {
  position: absolute;
  right: -200px;
  bottom: -240px;
  width: 680px;
  height: 680px;
  pointer-events: none;
}

.landing__deco-1 {
  fill: $menu-active;
  fill-opacity: 0.16;
}

.landing__deco-2 {
  fill: $secondary;
  fill-opacity: 0.1;
}

.landing__deco-3 {
  fill: #fff;
  fill-opacity: 0.04;
}

.landing__deco-ring {
  fill: none;
  stroke: #fff;
  stroke-opacity: 0.08;
  stroke-width: 1.5;
}

.landing__copy,
.landing__inst {
  position: relative;
}

.landing__copy {
  margin: auto 0;
  max-width: 560px;
}

.landing__statement {
  margin: 0;
  font-size: clamp(36px, 3.6vw, 54px);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.02em;
}

.landing__support {
  margin: 20px 0 0;
  max-width: 460px;
  font-size: 18px;
  line-height: 1.5;
  color: $on-navy-muted;
}

.landing__inst {
  margin: 32px 0 0;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 13px;
  color: $on-navy-muted;
}

.landing__action {
  grid-area: action;
  display: flex;
  padding: 32px 72px 0;
}

.landing__inner {
  margin: auto;
  width: 100%;
  max-width: 400px;
}

// The library notice is a fixed toast; here it becomes an inline warning card
// at the top of the action block. `:deep` beats its scoped selectors.
.landing__notice :deep(.hydra-closed-notice) {
  position: static;
  transform: none;
  z-index: auto;
  width: 100%;
  max-width: none;
  margin: 0 0 28px;
  padding: 12px 8px 12px 14px;
  border: 0;
  border-left: 4px solid $warning;
  border-radius: $radius;
  background: rgba(242, 192, 55, 0.18);
  color: #000;
  font-family: inherit;
  font-weight: 600;
  box-shadow: none;
}

.landing__notice :deep(.hydra-closed-notice-icon) {
  color: #000;
}

.landing__notice :deep(.hydra-closed-notice-close) {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 8px;
  color: #000;
}

.landing__notice :deep(.hydra-closed-notice-close:hover) {
  background: rgba(0, 0, 0, 0.06);
}

.landing__notice :deep(.hydra-closed-notice-close:focus-visible) {
  outline: 2px solid $primary;
}

.landing__eyebrow {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $text-subtitle;
}

.landing__title {
  margin: 0 0 12px;
  font-size: 34px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: $primary;
}

.landing__lead {
  margin: 0 0 32px;
  font-size: 16px;
  line-height: 1.5;
  color: $text-subtitle;
}

.landing__btn {
  min-height: 56px;
  border-radius: $radius;
  font-size: 18px;
  font-weight: 600;

  :deep(.q-btn__content) {
    gap: 10px;
  }

  &:hover {
    box-shadow: 0 0 0 4px rgba(32, 150, 210, 0.35);
  }

  &:focus-visible {
    outline: 3px solid $secondary;
    outline-offset: 3px;
  }
}

.landing__sso {
  margin: 16px 0 0;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: $text-subtitle;

  .line-icon {
    flex: none;
    margin-top: 2px;
  }
}

.landing__footer {
  grid-area: footer;
  padding: 32px 72px;
  font-size: 13px;
  color: $text-subtitle;
  text-align: center;
}

@media (max-width: 1100px) {
  .landing__brand,
  .landing__panel {
    padding-left: 48px;
    padding-right: 40px;
  }

  .landing__action {
    padding: 32px 40px 0;
  }

  .landing__footer {
    padding: 32px 40px;
  }
}

// Phones: compact brand header with the one-line statement, then the action.
@media (max-width: 800px) {
  .landing {
    min-height: 100vh;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto 1fr;
    grid-template-areas:
      'brand'
      'panel'
      'action'
      'footer';
  }

  .landing__brand {
    padding: 20px 16px;
    gap: 12px;
  }

  .landing__escudo {
    width: 56px;
    height: 56px;
    padding: 4px;
  }

  .landing__brand-name {
    font-size: 20px;
  }

  .landing__brand-org {
    font-size: 12px;
  }

  .landing__panel {
    padding: 0 16px 18px;
  }

  .landing__deco,
  .landing__support,
  .landing__inst {
    display: none;
  }

  .landing__copy {
    margin: 0;
  }

  .landing__statement {
    font-size: 15px;
    font-weight: 600;
    line-height: 1.35;
    letter-spacing: 0;
  }

  .landing__action {
    padding: 28px 16px 0;
  }

  .landing__inner {
    margin: 0 auto;
  }

  .landing__title {
    font-size: 28px;
  }

  .landing__lead {
    margin-bottom: 24px;
  }

  .landing__footer {
    align-self: end;
    padding: 24px 16px 32px;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .landing__notice :deep(.hydra-closed-notice-close) {
    transition: background-color 0.15s ease;
  }
}
</style>
