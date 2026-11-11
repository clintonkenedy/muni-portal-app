export const DEFAULT_SISTEMA_ICON = 'mdi-application-outline'

/**
 * URL a sistema card may open. Only absolute http(s) URLs are accepted, so a
 * stored `javascript:` or relative value never becomes a clickable link.
 *
 * @param {unknown} url
 * @returns {string|null}
 */
export function safeHttpUrl(url) {
  if (typeof url !== 'string' || url.trim() === '') return null
  try {
    const parsed = new URL(url.trim())
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : null
  } catch {
    return null
  }
}

/** Quasar icon name of a sistema, with a default when the core has none. */
export function sistemaIcon(icono) {
  return typeof icono === 'string' && icono.trim() !== '' ? icono.trim() : DEFAULT_SISTEMA_ICON
}

/** Name shown for the signed-in person: persona, then user name, then DNI. */
export function displayName(perfil) {
  return perfil?.persona?.nombre_completo || perfil?.user?.name || perfil?.user?.dni || ''
}

/** `YYYY-MM-DD…` → `DD/MM/YYYY`; anything else is returned as an empty string. */
export function formatFecha(value) {
  const match = typeof value === 'string' ? /^(\d{4})-(\d{2})-(\d{2})/.exec(value) : null
  return match ? `${match[3]}/${match[2]}/${match[1]}` : ''
}

/** Message shown when a request to the core fails. */
export function loadErrorMessage(error) {
  const status = error?.response?.status
  if (status === 403) return 'Tu usuario está inactivo. Comunicate con el área de sistemas.'
  if (status === 404) return 'No encontramos tu usuario en el sistema de usuarios.'
  if (status === 401) return 'Tu sesión venció. Volvé a ingresar.'
  return 'No pudimos cargar la información. Intentá de nuevo en unos minutos.'
}
