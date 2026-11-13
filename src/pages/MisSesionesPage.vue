<template>
  <q-page padding class="portal-page">
    <div class="q-mx-auto" style="max-width: 800px">
      <div class="row items-center justify-between q-gutter-y-sm">
        <h1 class="portal-page__title">Mis sesiones</h1>
        <q-btn
          outline
          no-caps
          color="negative"
          icon="mdi-logout-variant"
          label="Cerrar todas las sesiones"
          :loading="closing"
          @click="confirmOpen = true"
        />
      </div>

      <q-banner
        v-if="portal.closeSesionesError"
        rounded
        class="bg-red-1 text-negative q-mb-md"
        role="alert"
      >
        <template #avatar><q-icon name="mdi-alert-circle-outline" /></template>
        {{ portal.closeSesionesError }}
        <template #action>
          <q-btn flat no-caps label="Reintentar" :loading="closing" @click="closeAll" />
        </template>
      </q-banner>

      <q-banner
        v-if="portal.sesionesError"
        rounded
        class="bg-red-1 text-negative q-mb-md"
        role="alert"
      >
        <template #avatar><q-icon name="mdi-alert-circle-outline" /></template>
        {{ portal.sesionesError }}
        <template #action>
          <q-btn
            flat
            no-caps
            label="Reintentar"
            :loading="portal.sesionesLoading"
            @click="portal.loadSesiones()"
          />
        </template>
      </q-banner>

      <q-card
        v-if="portal.sesionesLoading && !portal.sesionesLoaded"
        flat
        bordered
        class="q-pa-md"
        aria-busy="true"
      >
        <div v-for="n in 3" :key="n" class="q-mb-sm">
          <q-skeleton type="text" width="40%" />
          <q-skeleton type="text" width="60%" />
        </div>
      </q-card>

      <q-card v-else-if="isEmpty" flat bordered>
        <q-card-section class="text-center text-grey-8 q-pa-xl">
          <q-icon name="mdi-monitor-off" size="64px" color="grey-5" />
          <p class="text-subtitle1 q-mt-md q-mb-none">No tenés sesiones abiertas.</p>
        </q-card-section>
      </q-card>

      <q-card v-else-if="portal.sesiones.length" flat bordered>
        <q-list separator>
          <q-item v-for="(sesion, index) in portal.sesiones" :key="index">
            <q-item-section avatar>
              <q-icon name="mdi-application-outline" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{ orDash(sesion.sistema) }}</q-item-label>
              <q-item-label caption>Desde {{ formatFechaHora(sesion.desde) }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>

    <q-dialog v-model="confirmOpen">
      <q-card style="width: 100%; max-width: 420px">
        <q-card-section class="text-h6">¿Cerrar todas las sesiones?</q-card-section>
        <q-card-section class="q-pt-none">
          Vas a cerrar sesión en todos los sistemas, incluido este portal.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat no-caps label="Cancelar" />
          <q-btn
            unelevated
            no-caps
            color="negative"
            label="Cerrar todas las sesiones"
            :loading="closing"
            @click="closeAll"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useHydraAuth } from '@munipuno/hydra-auth-vue'
import { usePortalStore } from 'src/stores/portal'
import { formatFechaHora, orDash } from 'src/utils/cuenta'

// The Pinia store (plain reactive state), not `useAuth()` (refs).
const auth = useHydraAuth()
const portal = usePortalStore()

const confirmOpen = ref(false)
// Stays true while the portal signs out, after the store was cleared.
const leaving = ref(false)
const closing = computed(() => portal.closingSesiones || leaving.value)

const isEmpty = computed(() => portal.sesionesLoaded && portal.sesiones.length === 0)

async function closeAll() {
  if (closing.value) return
  const closed = await portal.closeAllSesiones()
  confirmOpen.value = false
  if (!closed) return
  // Same as the drawer's "Cerrar sesión": Hydra sends the browser back to the landing (/).
  leaving.value = true
  portal.clear()
  await auth.logout()
}

onMounted(() => portal.loadSesiones())
</script>
