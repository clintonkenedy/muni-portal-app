<template>
  <div class="fullscreen flex flex-center q-pa-md">
    <!-- Explains an automatic session close (?session_closed=idle|max) -->
    <HydraSessionClosedNotice />

    <q-card flat bordered class="q-pa-lg text-center" style="width: 100%; max-width: 420px">
      <img
        src="/inicio_login.jpg"
        alt="Municipalidad Provincial de Puno"
        style="max-width: 220px; width: 100%"
      />
      <h1 class="text-h5 text-weight-bold text-primary q-mt-md q-mb-xs">Portal de Sistemas</h1>
      <p class="text-body2 text-grey-8 q-mb-lg">
        Ingresá para ver los sistemas a los que tenés acceso y tu perfil.
      </p>
      <q-btn
        color="primary"
        unelevated
        no-caps
        size="lg"
        label="Ingresar"
        class="full-width"
        to="/sistemas"
      />
    </q-card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { HydraSessionClosedNotice, useHydraAuth } from '@munipuno/hydra-auth-vue'

// The Pinia store (plain reactive state). `useAuth()` returns refs, so its
// `user` is always truthy as an object.
const auth = useHydraAuth()
const router = useRouter()

// A signed-in person lands here right after login (the callback goes to `/`).
onMounted(() => {
  if (auth.user) router.replace('/sistemas')
})
</script>
