<template>
  <q-layout view="lHh LpR lFf">
    <HydraDegradedBanner />
    <HydraSessionGuard />

    <!-- Phones and tablets: slim navy bar that opens the drawer as an overlay. -->
    <q-header v-if="$q.screen.lt.md" class="bg-primary text-white portal-topbar">
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          aria-label="Abrir menú"
          :aria-expanded="drawerOpen ? 'true' : 'false'"
          aria-controls="portal-drawer"
          @click="drawerOpen = !drawerOpen"
        >
          <LineIcon name="menu" />
        </q-btn>
        <img
          src="/escudo-mpp.jpg"
          alt=""
          width="32"
          height="32"
          class="portal-topbar__logo q-ml-sm"
        />
        <q-toolbar-title class="text-subtitle1 text-weight-bold"
          >Portal de Sistemas</q-toolbar-title
        >
      </q-toolbar>
    </q-header>

    <q-drawer
      id="portal-drawer"
      v-model="drawerOpen"
      show-if-above
      :width="280"
      :breakpoint="1023"
      class="portal-drawer"
    >
      <div class="column no-wrap full-height q-pa-md">
        <div class="portal-drawer__brand row no-wrap items-center">
          <!-- Same coat of arms as the core and GTSV menus, served locally (public/escudo-mpp.jpg). -->
          <img
            src="/escudo-mpp.jpg"
            alt="Escudo de la Municipalidad Provincial de Puno"
            width="64"
            height="64"
            class="portal-drawer__logo"
          />
          <div>
            <div class="portal-drawer__title">Portal de Sistemas - MPP</div>
            <div class="portal-drawer__subtitle">Municipalidad Provincial de Puno</div>
          </div>
        </div>

        <div class="portal-me row no-wrap items-center">
          <div class="portal-me__text">
            <div class="portal-me__name">{{ name || 'Mi cuenta' }}</div>
            <div v-if="userDetail" class="portal-me__detail">{{ userDetail }}</div>
          </div>
          <q-avatar size="48px" class="portal-me__avatar" aria-hidden="true">
            <template v-if="userInitials">{{ userInitials }}</template>
            <LineIcon v-else name="user" />
          </q-avatar>
        </div>

        <nav aria-label="Principal" class="col column no-wrap">
          <q-list class="portal-nav">
            <q-item
              to="/sistemas"
              class="portal-nav__item"
              active-class="portal-nav__item--active"
              @click="closeOnMobile"
            >
              <q-item-section avatar><LineIcon name="grid" /></q-item-section>
              <q-item-section>Mis sistemas</q-item-section>
              <q-item-section v-if="portal.sistemasLoaded" side>
                <span class="portal-nav__count" :aria-label="`${sistemasCount} disponibles`">
                  {{ sistemasCount }}
                </span>
              </q-item-section>
            </q-item>
            <q-item
              to="/perfil"
              class="portal-nav__item"
              active-class="portal-nav__item--active"
              @click="closeOnMobile"
            >
              <q-item-section avatar><LineIcon name="user" /></q-item-section>
              <q-item-section>Mi perfil</q-item-section>
            </q-item>
          </q-list>

          <div class="portal-drawer__bottom">
            <button type="button" class="portal-logout" @click="logout">
              <LineIcon name="power" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </nav>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { HydraDegradedBanner, HydraSessionGuard, useHydraAuth } from '@munipuno/hydra-auth-vue'
import LineIcon from 'components/LineIcon.vue'
import { usePortalStore } from 'src/stores/portal'
import { activeTrabajo, displayName, initials, openableCount } from 'src/utils/portal'

const $q = useQuasar()
// The Pinia store (plain reactive state), not `useAuth()` (refs).
const auth = useHydraAuth()
const portal = usePortalStore()

// `show-if-above` opens it on desktop; on small screens it starts closed.
const drawerOpen = ref(false)

const name = computed(() => displayName(portal.perfil) || auth.name || '')
const userInitials = computed(() => initials(portal.perfil, auth.name || ''))
const cargo = computed(() => activeTrabajo(portal.perfil)?.cargo || '')
// Like GTSV: the email under the name; the cargo when there is no email.
const userDetail = computed(() => portal.perfil?.user?.email || auth.email || cargo.value)
const sistemasCount = computed(() => openableCount(portal.sistemas))

function closeOnMobile() {
  if ($q.screen.lt.md) drawerOpen.value = false
}

onMounted(() => {
  if (!portal.perfil && !portal.perfilLoading) portal.loadPerfil()
})

async function logout() {
  portal.clear()
  await auth.logout()
}
</script>
