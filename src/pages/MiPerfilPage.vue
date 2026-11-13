<template>
  <q-page padding class="portal-page">
    <div class="q-mx-auto" style="max-width: 800px">
      <h1 class="portal-page__title">Mi perfil</h1>

      <q-banner
        v-if="portal.perfilError"
        rounded
        class="bg-red-1 text-negative q-mb-md"
        role="alert"
      >
        <template #avatar><q-icon name="mdi-alert-circle-outline" /></template>
        {{ portal.perfilError }}
        <template #action>
          <q-btn
            flat
            no-caps
            label="Reintentar"
            :loading="portal.perfilLoading"
            @click="portal.loadPerfil()"
          />
        </template>
      </q-banner>

      <q-card v-if="portal.perfilLoading && !perfil" flat bordered class="q-pa-md" aria-busy="true">
        <q-skeleton type="text" class="text-h6" width="50%" />
        <q-skeleton type="text" width="80%" />
        <q-skeleton type="text" width="65%" />
      </q-card>

      <template v-else-if="perfil">
        <q-card flat bordered class="q-mb-md perfil-header">
          <q-card-section class="row no-wrap items-center perfil-header__body">
            <q-avatar size="64px" class="perfil-header__avatar" aria-hidden="true">
              <template v-if="avatarInitials">{{ avatarInitials }}</template>
              <q-icon v-else name="mdi-account" />
            </q-avatar>
            <div class="col">
              <h2 class="perfil-header__name">{{ displayName(perfil) }}</h2>
              <dl class="perfil-header__facts">
                <div v-if="trabajo?.cargo">
                  <dt><q-icon name="mdi-briefcase-outline" /><span class="sr-only">Cargo</span></dt>
                  <dd>{{ trabajo.cargo }}</dd>
                </div>
                <div v-if="trabajo?.sede">
                  <dt><q-icon name="mdi-map-marker-outline" /><span class="sr-only">Sede</span></dt>
                  <dd>{{ trabajo.sede }}</dd>
                </div>
                <div>
                  <dt>
                    <q-icon name="mdi-card-account-details-outline" /><span class="sr-only"
                      >Documento</span
                    >
                  </dt>
                  <dd>DNI {{ perfil.user?.dni }}</dd>
                </div>
              </dl>
            </div>
            <q-chip
              dense
              :color="perfil.user?.estado ? 'green-1' : 'red-1'"
              :text-color="perfil.user?.estado ? 'positive' : 'negative'"
            >
              {{ perfil.user?.estado ? 'Activo' : 'Inactivo' }}
            </q-chip>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="q-mb-md">
          <q-card-section class="perfil-section__title q-pb-none">Cuenta</q-card-section>
          <q-list>
            <PerfilDato label="Usuario" :value="perfil.user?.name" />
            <PerfilDato label="Correo" :value="perfil.user?.email" />
          </q-list>
        </q-card>

        <q-card flat bordered class="q-mb-md">
          <q-card-section class="perfil-section__title q-pb-none">Datos personales</q-card-section>
          <q-list v-if="perfil.persona">
            <PerfilDato label="Nombres" :value="perfil.persona.nombres" />
            <PerfilDato label="Apellido paterno" :value="perfil.persona.apellido_paterno" />
            <PerfilDato label="Apellido materno" :value="perfil.persona.apellido_materno" />
            <PerfilDato label="Documento" :value="perfil.persona.numero_documento" />
            <PerfilDato label="Sexo" :value="perfil.persona.sexo" />
            <PerfilDato
              label="Fecha de nacimiento"
              :value="formatFecha(perfil.persona.fecha_nacimiento)"
            />
          </q-list>
          <q-card-section v-else class="text-body2 text-grey-8">
            Sin datos personales registrados.
          </q-card-section>
        </q-card>

        <q-card flat bordered>
          <q-card-section class="perfil-section__title q-pb-none">Puesto</q-card-section>
          <q-list v-if="perfil.trabajos.length" separator>
            <q-item v-for="(trabajo, index) in perfil.trabajos" :key="index">
              <q-item-section avatar
                ><q-icon name="mdi-briefcase-outline" color="primary"
              /></q-item-section>
              <q-item-section>
                <q-item-label>{{ trabajo.cargo || 'Sin cargo' }}</q-item-label>
                <q-item-label caption>
                  {{ [trabajo.oficina, trabajo.sede].filter(Boolean).join(' · ') || 'Sin oficina' }}
                </q-item-label>
                <q-item-label v-if="trabajo.email" caption>{{ trabajo.email }}</q-item-label>
              </q-item-section>
              <q-item-section v-if="!trabajo.activo" side>
                <q-chip dense color="grey-3" text-color="grey-8">Inactivo</q-chip>
              </q-item-section>
            </q-item>
          </q-list>
          <q-card-section v-else class="text-body2 text-grey-8"
            >Sin puesto asignado.</q-card-section
          >
        </q-card>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import PerfilDato from 'components/PerfilDato.vue'
import { usePortalStore } from 'src/stores/portal'
import { activeTrabajo, displayName, formatFecha, initials } from 'src/utils/portal'

const portal = usePortalStore()
const perfil = computed(() => portal.perfil)
const trabajo = computed(() => activeTrabajo(portal.perfil))
const avatarInitials = computed(() => initials(portal.perfil))

// Always refresh: the layout may have loaded it a while ago.
onMounted(() => portal.loadPerfil())
</script>
