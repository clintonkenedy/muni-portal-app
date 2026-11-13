import { apiCore } from 'src/boot/axios'

// Own-data endpoints of the core (muni-usuarios). The person is identified by
// the token, never by a parameter.

/** @returns {Promise<Array<{id:number,nombre:string,descripcion:?string,url:?string,icono:?string,roles:string[]}>>} */
export async function fetchMisSistemas() {
  const { data } = await apiCore.get('/api/me/sistemas')
  return Array.isArray(data?.data) ? data.data : []
}

/**
 * `trabajos[].oficina` is the SGD office name, or null.
 * @returns {Promise<{user:object,persona:?object,trabajos:object[]}>}
 */
export async function fetchMiPerfil() {
  const { data } = await apiCore.get('/api/me/perfil')
  return {
    user: data?.user ?? null,
    persona: data?.persona ?? null,
    trabajos: Array.isArray(data?.trabajos) ? data.trabajos : [],
  }
}

/**
 * Change the own password. Rejects with the axios error (422 field errors,
 * 503 idp_unavailable) so the page can map it with `passwordErrors`.
 *
 * @param {{password_actual:string,password:string,password_confirmar:string}} form
 * @returns {Promise<string>} the core's success message
 */
export async function changeMyPassword(form) {
  const { data } = await apiCore.post('/api/me/password', {
    password_actual: form.password_actual,
    password: form.password,
    password_confirmar: form.password_confirmar,
  })
  return data?.message || 'Contraseña actualizada correctamente.'
}

/** @returns {Promise<Array<{fecha:?string,ip:?string,user_agent:?string,sistema:?string,exitoso:boolean}>>} newest first */
export async function fetchMisAccesos() {
  const { data } = await apiCore.get('/api/me/accesos')
  return Array.isArray(data?.data) ? data.data : []
}

/** @returns {Promise<Array<{sistema:?string,desde:?string}>>} newest first */
export async function fetchMisSesiones() {
  const { data } = await apiCore.get('/api/me/sesiones')
  return Array.isArray(data?.data) ? data.data : []
}

/** Revoke every Hydra login and consent session of the person. */
export async function closeAllMySesiones() {
  await apiCore.delete('/api/me/sesiones')
  return true
}
