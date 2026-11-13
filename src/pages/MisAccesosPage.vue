<template>
  <q-page padding class="portal-page">
    <div class="q-mx-auto" style="max-width: 800px">
      <h1 class="portal-page__title">Últimos accesos</h1>

      <q-banner
        v-if="portal.accesosError"
        rounded
        class="bg-red-1 text-negative q-mb-md"
        role="alert"
      >
        <template #avatar><q-icon name="mdi-alert-circle-outline" /></template>
        {{ portal.accesosError }}
        <template #action>
          <q-btn
            flat
            no-caps
            label="Reintentar"
            :loading="portal.accesosLoading"
            @click="portal.loadAccesos()"
          />
        </template>
      </q-banner>

      <q-card
        v-if="portal.accesosLoading && !portal.accesosLoaded"
        flat
        bordered
        class="q-pa-md"
        aria-busy="true"
      >
        <div v-for="n in 3" :key="n" class="q-mb-sm">
          <q-skeleton type="text" width="40%" />
          <q-skeleton type="text" width="70%" />
        </div>
      </q-card>

      <q-card v-else-if="isEmpty" flat bordered>
        <q-card-section class="text-center text-grey-8 q-pa-xl">
          <q-icon name="mdi-history" size="64px" color="grey-5" />
          <p class="text-subtitle1 q-mt-md q-mb-none">Todavía no hay accesos registrados.</p>
        </q-card-section>
      </q-card>

      <q-card v-else-if="portal.accesos.length" flat bordered>
        <q-list separator>
          <q-item v-for="(acceso, index) in portal.accesos" :key="index">
            <q-item-section avatar>
              <q-icon
                :name="acceso.exitoso ? 'mdi-login' : 'mdi-alert-outline'"
                :color="acceso.exitoso ? 'primary' : 'negative'"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">{{
                formatFechaHora(acceso.fecha)
              }}</q-item-label>
              <!-- A long IPv6 address has no break points: let it wrap on narrow screens. -->
              <q-item-label caption style="overflow-wrap: anywhere">
                {{ orDash(acceso.sistema) }} · IP {{ orDash(acceso.ip) }}
              </q-item-label>
              <q-item-label caption>
                <span>
                  {{ userAgentLabel(acceso.user_agent) }}
                  <q-tooltip v-if="orDash(acceso.user_agent) !== DASH" max-width="420px">{{
                    acceso.user_agent
                  }}</q-tooltip>
                </span>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-chip
                dense
                :color="acceso.exitoso ? 'green-1' : 'red-1'"
                :text-color="acceso.exitoso ? 'positive' : 'negative'"
              >
                {{ acceso.exitoso ? 'Exitoso' : 'Fallido' }}
              </q-chip>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { usePortalStore } from 'src/stores/portal'
import { DASH, formatFechaHora, orDash, userAgentLabel } from 'src/utils/cuenta'

const portal = usePortalStore()

const isEmpty = computed(() => portal.accesosLoaded && portal.accesos.length === 0)

onMounted(() => portal.loadAccesos())
</script>
