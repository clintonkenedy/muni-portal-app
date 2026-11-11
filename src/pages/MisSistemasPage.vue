<template>
  <q-page padding>
    <div class="q-mx-auto" style="max-width: 1100px">
      <h1 class="text-h5 text-weight-bold q-mt-sm q-mb-md">Mis sistemas</h1>

      <q-banner
        v-if="portal.sistemasError"
        rounded
        class="bg-red-1 text-negative q-mb-md"
        role="alert"
      >
        <template #avatar><q-icon name="mdi-alert-circle-outline" /></template>
        {{ portal.sistemasError }}
        <template #action>
          <q-btn
            flat
            no-caps
            label="Reintentar"
            :loading="portal.sistemasLoading"
            @click="portal.loadSistemas()"
          />
        </template>
      </q-banner>

      <div
        v-if="portal.sistemasLoading && !portal.sistemasLoaded"
        class="row q-col-gutter-md"
        aria-busy="true"
      >
        <div v-for="n in 3" :key="n" class="col-12 col-sm-6 col-md-4">
          <q-card flat bordered class="sistema-card q-pa-md">
            <q-skeleton type="QAvatar" size="48px" />
            <q-skeleton type="text" class="text-subtitle1 q-mt-sm" width="60%" />
            <q-skeleton type="text" width="90%" />
          </q-card>
        </div>
      </div>

      <div
        v-else-if="portal.sistemasLoaded && portal.sistemas.length === 0"
        class="text-center text-grey-8 q-pa-xl"
      >
        <q-icon name="mdi-view-grid-plus-outline" size="64px" color="grey-5" />
        <p class="text-subtitle1 q-mt-md q-mb-none">No tenés sistemas asignados todavía.</p>
        <p class="text-body2">Si necesitás acceso a un sistema, pedilo al área de sistemas.</p>
      </div>

      <div v-else class="row q-col-gutter-md">
        <div v-for="sistema in portal.sistemas" :key="sistema.id" class="col-12 col-sm-6 col-md-4">
          <component
            :is="safeHttpUrl(sistema.url) ? 'a' : 'div'"
            v-bind="linkAttrs(sistema)"
            class="sistema-card"
            :class="{ 'sistema-card--disabled': !safeHttpUrl(sistema.url) }"
          >
            <q-card flat bordered class="full-height">
              <q-card-section class="row no-wrap items-start q-gutter-md">
                <q-avatar color="primary" text-color="white" rounded size="48px">
                  <q-icon :name="sistemaIcon(sistema.icono)" size="28px" />
                </q-avatar>
                <div class="col">
                  <div class="text-subtitle1 text-weight-bold">{{ sistema.nombre }}</div>
                  <div v-if="sistema.descripcion" class="text-body2 text-grey-8">
                    {{ sistema.descripcion }}
                  </div>
                </div>
                <q-icon
                  v-if="safeHttpUrl(sistema.url)"
                  name="mdi-open-in-new"
                  size="18px"
                  color="grey-7"
                />
              </q-card-section>

              <q-card-section class="q-pt-none">
                <q-chip
                  v-for="rol in sistema.roles"
                  :key="rol"
                  dense
                  color="blue-1"
                  text-color="primary"
                  class="q-ml-none"
                >
                  {{ rol }}
                </q-chip>
                <div v-if="!safeHttpUrl(sistema.url)" class="text-caption text-grey-7">
                  Sin dirección configurada
                </div>
              </q-card-section>
            </q-card>
          </component>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePortalStore } from 'src/stores/portal'
import { safeHttpUrl, sistemaIcon } from 'src/utils/portal'

const portal = usePortalStore()

function linkAttrs(sistema) {
  const href = safeHttpUrl(sistema.url)
  if (!href) return { 'aria-disabled': 'true' }
  return {
    href,
    target: '_blank',
    rel: 'noopener noreferrer',
    'aria-label': `Abrir ${sistema.nombre} en una pestaña nueva`,
  }
}

onMounted(() => portal.loadSistemas())
</script>
