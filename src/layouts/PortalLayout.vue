<template>
  <q-layout view="lHh LpR lFf">
    <HydraDegradedBanner />
    <HydraSessionGuard />

    <!-- Phones and tablets: light header with the menu button, as in GTSV. -->
    <q-header v-if="$q.screen.lt.md" class="portal-topbar">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Abrir menú"
          :aria-expanded="drawerOpen ? 'true' : 'false'"
          aria-controls="portal-drawer"
          @click="drawerOpen = !drawerOpen"
        />
        <q-toolbar-title class="text-subtitle1 text-weight-bold"
          >Portal de Sistemas</q-toolbar-title
        >
      </q-toolbar>
    </q-header>

    <!-- Same drawer as GTSV (front-sistrans/src/layouts/AdminLayout.vue + sidebar/MenuItem.vue). -->
    <q-drawer
      id="portal-drawer"
      v-model="drawerOpen"
      show-if-above
      side="left"
      :width="280"
      :breakpoint="1023"
      bordered
      class="portal-drawer"
    >
      <!-- TOP: system logo + user card -->
      <div class="absolute-top q-pa-none" style="height: 165px">
        <q-item
          to="/sistemas"
          clickable
          v-ripple
          class="text-white q-mx-sm q-mt-sm"
          style="border-radius: 10px"
          @click="closeOnMobile"
        >
          <q-item-section avatar>
            <q-avatar rounded size="48px">
              <!-- Same coat of arms as the core and GTSV menus, served locally. -->
              <img src="/escudo-mpp.jpg" alt="Escudo de la Municipalidad Provincial de Puno" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-white text-weight-bold text-h6">
              PORTAL DE SISTEMAS
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          to="/perfil"
          clickable
          v-ripple
          class="text-white q-ma-sm"
          style="border-radius: 10px; border: 1px solid #ffffff50"
          @click="closeOnMobile"
        >
          <q-item-section>
            <q-item-label lines="2" class="text-weight-bold">
              {{ name || 'Usuario' }}
            </q-item-label>
            <q-item-label v-if="userDetail" caption class="text-white text-weight-bold">
              {{ userDetail }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-avatar color="secondary" text-color="white">{{ initialMayus }}</q-avatar>
          </q-item-section>
        </q-item>
        <q-separator spaced dark />
      </div>

      <!-- MENU -->
      <q-scroll-area style="height: calc(100% - 165px - 80px); margin-top: 165px" class="q-mx-sm">
        <nav aria-label="Principal">
          <q-list padding>
            <q-item
              v-for="item in menu"
              :key="item.to"
              :to="item.to"
              clickable
              v-ripple
              dense
              active-class="my-menu-link"
              class="q-ma-xs q-pa-sm menu-item-link"
              @click="closeOnMobile"
            >
              <q-item-section side class="text-white">
                <LineIcon :name="item.icon" :size="22" />
              </q-item-section>
              <q-item-section>
                <span
                  class="text-white"
                  :class="isActive(item.to) ? 'text-weight-bold' : 'text-weight-medium'"
                >
                  {{ item.label }}
                </span>
              </q-item-section>
            </q-item>
          </q-list>
        </nav>
      </q-scroll-area>

      <!-- BOTTOM: logout -->
      <div class="absolute-bottom q-pa-xs">
        <q-separator spaced dark />
        <q-item
          clickable
          v-ripple
          class="bg-red-10 text-white q-ma-sm"
          style="border-radius: 10px"
          @click="logout"
        >
          <q-item-section avatar>
            <q-icon name="ion-ios-power" color="white" />
          </q-item-section>
          <q-item-section class="text-weight-bold">CERRAR SESIÓN</q-item-section>
        </q-item>
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
import { useRoute } from 'vue-router'
import { HydraDegradedBanner, HydraSessionGuard, useHydraAuth } from '@munipuno/hydra-auth-vue'
import LineIcon from 'components/LineIcon.vue'
import { usePortalStore } from 'src/stores/portal'
import { activeTrabajo, displayName } from 'src/utils/portal'

const $q = useQuasar()
const route = useRoute()
// The Pinia store (plain reactive state), not `useAuth()` (refs).
const auth = useHydraAuth()
const portal = usePortalStore()

// `show-if-above` opens it on desktop; on small screens it starts closed.
const drawerOpen = ref(false)

// Menu entries, rendered like GTSV's sidebar/MenuItem.vue.
const menu = [
  { label: 'Mis sistemas', to: '/sistemas', icon: 'grid' },
  { label: 'Mi perfil', to: '/perfil', icon: 'user' },
]

const name = computed(() => displayName(portal.perfil) || auth.name || '')
// GTSV shows the first letter of the name in the avatar.
const initialMayus = computed(() => name.value.charAt(0).toUpperCase() || '?')
const cargo = computed(() => activeTrabajo(portal.perfil)?.cargo || '')
// Like GTSV: the email under the name; the cargo when there is no email.
const userDetail = computed(() => portal.perfil?.user?.email || auth.email || cargo.value)

function isActive(to) {
  return route.path === to || route.path.startsWith(`${to}/`)
}

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
