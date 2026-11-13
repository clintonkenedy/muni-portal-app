<template>
  <q-page padding class="portal-page">
    <div class="launcher column items-center q-mx-auto">
      <h1 class="launcher__greeting">{{ greeting }}</h1>
      <p class="launcher__subtitle">¿A qué sistema quiere ingresar hoy?</p>

      <form
        v-if="!isEmpty"
        role="search"
        class="launcher__search"
        aria-label="Buscar sistema"
        @submit.prevent
      >
        <q-input
          ref="searchInput"
          v-model="query"
          outlined
          clearable
          type="search"
          bg-color="white"
          placeholder="Buscar sistema"
          aria-label="Buscar sistema"
          autocomplete="off"
          class="portal-field"
        >
          <template #prepend><q-icon name="mdi-magnify" /></template>
          <template #append>
            <kbd class="launcher__kbd" aria-hidden="true">/</kbd>
          </template>
        </q-input>
      </form>

      <q-banner
        v-if="portal.sistemasError"
        rounded
        class="bg-red-1 text-negative q-mt-lg full-width launcher__banner"
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

      <h2 class="sr-only">Mis sistemas</h2>

      <ul
        v-if="portal.sistemasLoading && !portal.sistemasLoaded"
        class="launcher__grid"
        aria-busy="true"
      >
        <li v-for="n in 3" :key="n" class="launcher-tile">
          <q-skeleton width="104px" height="104px" class="launcher-tile__skeleton" />
          <q-skeleton type="text" width="70%" class="q-mt-md" />
          <q-skeleton type="text" width="50%" />
        </li>
      </ul>

      <div v-else-if="isEmpty" class="text-center text-grey-8 q-pa-xl">
        <q-icon name="mdi-view-grid-plus-outline" size="64px" color="grey-5" />
        <p class="text-subtitle1 q-mt-md q-mb-none">No tenés sistemas asignados todavía.</p>
        <p class="text-body2">Si necesitás acceso a un sistema, pedilo al área de sistemas.</p>
      </div>

      <p
        v-else-if="tiles.length > 0 && visibleTiles.length === 0"
        class="launcher__no-results"
        role="status"
      >
        Ningún sistema coincide con la búsqueda.
      </p>

      <ul v-else class="launcher__grid">
        <li v-for="tile in visibleTiles" :key="tile.sistema.id">
          <a
            v-if="tile.href"
            class="launcher-tile launcher-tile--link"
            :href="tile.href"
            target="_blank"
            rel="noopener noreferrer"
            :title="tile.sistema.descripcion || undefined"
            :aria-label="tile.label"
          >
            <span class="launcher-tile__icon" :class="`bg-${tile.color}`">
              <q-icon :name="sistemaIcon(tile.sistema.icono)" size="48px" />
              <span class="launcher-tile__badge" aria-hidden="true">
                <q-icon name="mdi-open-in-new" size="14px" />
              </span>
            </span>
            <span class="launcher-tile__name">{{ tile.sistema.nombre }}</span>
            <span class="launcher-tile__roles">
              <template v-if="tile.roles.first">
                {{ tile.roles.first }}
                <span
                  v-if="tile.roles.extra"
                  class="launcher-tile__more"
                  :title="tile.sistema.roles.slice(1).join(', ')"
                  >+{{ tile.roles.extra }}</span
                >
              </template>
              <template v-else>Sin rol asignado</template>
            </span>
            <span class="launcher-tile__open" aria-hidden="true">
              Abrir <q-icon name="mdi-open-in-new" size="14px" />
            </span>
          </a>

          <div
            v-else
            class="launcher-tile launcher-tile--disabled"
            aria-disabled="true"
            :title="tile.sistema.descripcion || undefined"
          >
            <span class="launcher-tile__icon">
              <q-icon :name="sistemaIcon(tile.sistema.icono)" size="48px" />
            </span>
            <span class="launcher-tile__name">{{ tile.sistema.nombre }}</span>
            <span class="launcher-tile__roles">
              <template v-if="tile.roles.first">
                {{ tile.roles.first }}
                <span v-if="tile.roles.extra" class="launcher-tile__more"
                  >+{{ tile.roles.extra }}</span
                >
              </template>
              <template v-else>Sin rol asignado</template>
            </span>
            <span class="launcher-tile__off">Sin dirección configurada</span>
          </div>
        </li>
      </ul>

      <p v-if="tiles.length > 0" class="launcher__legend gt-xs">
        <span
          ><q-icon name="mdi-open-in-new" size="14px" />Cada sistema se abre en una pestaña
          nueva</span
        >
        <span>Pulse <strong>/</strong> para buscar</span>
      </p>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useHydraAuth } from '@munipuno/hydra-auth-vue'
import { usePortalStore } from 'src/stores/portal'
import { filterSistemas, firstName, rolesSummary, safeHttpUrl, sistemaIcon } from 'src/utils/portal'

const auth = useHydraAuth()
const portal = usePortalStore()

const query = ref('')
const searchInput = ref(null)

const greeting = computed(() => {
  const nombre = firstName(portal.perfil, auth.name || '')
  return nombre ? `Hola, ${nombre}` : 'Hola'
})

const isEmpty = computed(() => portal.sistemasLoaded && portal.sistemas.length === 0)

// Colors follow the position in the full list, so they stay put while searching.
const tiles = computed(() =>
  portal.sistemas.map((sistema, index) => {
    const roles = rolesSummary(sistema.roles)
    const href = safeHttpUrl(sistema.url)
    return {
      sistema,
      href,
      roles,
      color: index % 2 === 0 ? 'primary' : 'secondary',
      label: href
        ? `Abrir ${sistema.nombre} en una pestaña nueva` +
          (roles.first ? `, roles: ${sistema.roles.join(', ')}` : '')
        : undefined,
    }
  }),
)

const visibleTiles = computed(() => {
  const visible = new Set(filterSistemas(portal.sistemas, query.value))
  return tiles.value.filter((tile) => visible.has(tile.sistema))
})

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

// "/" jumps to the search field unless the person is already typing somewhere.
function onKeydown(event) {
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return
  if (isTypingTarget(event.target) || !searchInput.value) return
  event.preventDefault()
  searchInput.value.focus()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  portal.loadSistemas()
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>
