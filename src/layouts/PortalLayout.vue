<template>
  <q-layout view="hHh lpR fFf">
    <HydraDegradedBanner />
    <HydraSessionGuard />

    <q-header elevated class="portal-header" height-hint="98">
      <q-toolbar>
        <q-avatar rounded size="40px" class="q-mr-sm">
          <img src="/icons/favicon-128x128.png" alt="Municipalidad de Puno" />
        </q-avatar>
        <q-toolbar-title class="text-weight-bold">
          {{ $q.screen.lt.sm ? 'Portal' : 'Portal de Sistemas' }}
        </q-toolbar-title>

        <q-btn
          flat
          no-caps
          round-dense
          icon="mdi-account-circle"
          :label="userLabel"
          aria-label="Mi cuenta"
        >
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 220px">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ name || 'Mi cuenta' }}</q-item-label>
                  <q-item-label v-if="dni" caption>DNI {{ dni }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup to="/perfil">
                <q-item-section avatar><q-icon name="mdi-account-outline" /></q-item-section>
                <q-item-section>Mi perfil</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar><q-icon name="mdi-logout" /></q-item-section>
                <q-item-section>Cerrar sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>

      <q-tabs align="left" no-caps indicator-color="primary" active-color="primary">
        <q-route-tab to="/sistemas" icon="mdi-view-grid-outline" label="Mis sistemas" />
        <q-route-tab to="/perfil" icon="mdi-account-outline" label="Mi perfil" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { HydraDegradedBanner, HydraSessionGuard, useHydraAuth } from '@munipuno/hydra-auth-vue'
import { usePortalStore } from 'src/stores/portal'
import { displayName } from 'src/utils/portal'

const $q = useQuasar()
// The Pinia store (plain reactive state), not `useAuth()` (refs).
const auth = useHydraAuth()
const portal = usePortalStore()

const name = computed(() => displayName(portal.perfil) || auth.name || '')
const dni = computed(() => portal.perfil?.user?.dni ?? auth.user?.profile?.sub ?? '')
// On phones the toolbar only has room for the icon.
const userLabel = computed(() => ($q.screen.lt.sm ? undefined : name.value || undefined))

onMounted(() => {
  if (!portal.perfil && !portal.perfilLoading) portal.loadPerfil()
})

async function logout() {
  portal.clear()
  await auth.logout()
}
</script>
