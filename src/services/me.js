import { apiCore } from 'src/boot/axios'

// Own-data endpoints of the core (muni-usuarios). The person is identified by
// the token, never by a parameter.

/** @returns {Promise<Array<{id:number,nombre:string,descripcion:?string,url:?string,icono:?string,roles:string[]}>>} */
export async function fetchMisSistemas() {
  const { data } = await apiCore.get('/api/me/sistemas')
  return Array.isArray(data?.data) ? data.data : []
}

/** @returns {Promise<{user:object,persona:?object,trabajos:object[]}>} */
export async function fetchMiPerfil() {
  const { data } = await apiCore.get('/api/me/perfil')
  return {
    user: data?.user ?? null,
    persona: data?.persona ?? null,
    trabajos: Array.isArray(data?.trabajos) ? data.trabajos : [],
  }
}
