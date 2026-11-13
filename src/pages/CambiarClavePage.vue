<template>
  <q-page padding class="portal-page">
    <div class="q-mx-auto" style="max-width: 560px">
      <h1 class="portal-page__title">Cambiar mi clave</h1>

      <q-banner v-if="generalError" rounded class="bg-red-1 text-negative q-mb-md" role="alert">
        <template #avatar><q-icon name="mdi-alert-circle-outline" /></template>
        {{ generalError }}
        <template #action>
          <q-btn flat no-caps label="Reintentar" :loading="saving" @click="submit" />
        </template>
      </q-banner>

      <q-card flat bordered>
        <q-card-section>
          <form novalidate class="column q-gutter-y-sm" @submit.prevent="submit">
            <q-input
              v-model="form.password_actual"
              outlined
              label="Contraseña actual"
              :type="showPasswords ? 'text' : 'password'"
              autocomplete="current-password"
              class="portal-field"
              :error="!!fieldErrors.password_actual"
              :error-message="fieldErrors.password_actual"
              :disable="saving"
            />
            <q-input
              v-model="form.password"
              outlined
              label="Nueva contraseña"
              :type="showPasswords ? 'text' : 'password'"
              autocomplete="new-password"
              hint="Al menos 8 caracteres."
              class="portal-field"
              :error="!!fieldErrors.password"
              :error-message="fieldErrors.password"
              :disable="saving"
            />
            <q-input
              v-model="form.password_confirmar"
              outlined
              label="Repetir nueva contraseña"
              :type="showPasswords ? 'text' : 'password'"
              autocomplete="new-password"
              class="portal-field"
              :error="!!fieldErrors.password_confirmar"
              :error-message="fieldErrors.password_confirmar"
              :disable="saving"
            />
            <q-checkbox v-model="showPasswords" label="Mostrar contraseñas" :disable="saving" />
            <div class="row justify-end">
              <q-btn
                type="submit"
                color="primary"
                unelevated
                no-caps
                label="Cambiar contraseña"
                :loading="saving"
              />
            </div>
          </form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { changeMyPassword } from 'src/services/me'
import { PASSWORD_UPDATED_MESSAGE, passwordErrors, validatePasswordForm } from 'src/utils/cuenta'

const $q = useQuasar()

// Passwords live only in this page (never in the Pinia store).
const emptyForm = () => ({ password_actual: '', password: '', password_confirmar: '' })
const form = reactive(emptyForm())
const fieldErrors = ref({})
const generalError = ref(null)
const saving = ref(false)
const showPasswords = ref(false)

async function submit() {
  if (saving.value) return
  generalError.value = null
  fieldErrors.value = validatePasswordForm(form)
  if (Object.keys(fieldErrors.value).length > 0) return

  saving.value = true
  try {
    await changeMyPassword(form)
    Object.assign(form, emptyForm())
    showPasswords.value = false
    $q.notify({ type: 'positive', message: PASSWORD_UPDATED_MESSAGE })
  } catch (error) {
    const { fields, general } = passwordErrors(error)
    fieldErrors.value = fields
    generalError.value = general
  } finally {
    saving.value = false
  }
}
</script>
