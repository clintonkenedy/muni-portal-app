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

/** Lowercase text without accents or surrounding spaces, for searching. */
export function normalizeText(value) {
  if (typeof value !== 'string') return ''
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Sistemas whose name, description or role names contain every word of the
 * query, ignoring case and accents. A blank query keeps the whole list.
 */
export function filterSistemas(sistemas, query) {
  const list = Array.isArray(sistemas) ? sistemas : []
  const words = normalizeText(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return list
  return list.filter((sistema) => {
    const haystack = [sistema?.nombre, sistema?.descripcion, ...(sistema?.roles ?? [])]
      .map(normalizeText)
      .join(' ')
    return words.every((word) => haystack.includes(word))
  })
}

/** First role of a sistema and how many more it has (`{ first, extra }`). */
export function rolesSummary(roles) {
  const list = Array.isArray(roles) ? roles.filter((rol) => typeof rol === 'string' && rol) : []
  return { first: list[0] ?? null, extra: Math.max(list.length - 1, 0) }
}

function words(value) {
  return typeof value === 'string' ? value.trim().split(/\s+/).filter(Boolean) : []
}

function capitalize(word) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
}

/**
 * Given name used in the greeting: the persona's first `nombres` word, else
 * the first word of the display name (or `fallbackName`); empty when unknown.
 */
export function firstName(perfil, fallbackName = '') {
  const [nombre] = words(perfil?.persona?.nombres)
  const [fallback] = words(displayName(perfil) || fallbackName)
  return capitalize(nombre || fallback || '')
}

/** Avatar initials: first given name + first surname, else the first two words of the name. */
export function initials(perfil, fallbackName = '') {
  const [nombre] = words(perfil?.persona?.nombres)
  const [apellido] = words(perfil?.persona?.apellido_paterno)
  const letters =
    nombre && apellido ? [nombre, apellido] : words(displayName(perfil) || fallbackName).slice(0, 2)
  return letters.map((word) => word.charAt(0).toUpperCase()).join('')
}

/** First active trabajo of the profile, or null. */
export function activeTrabajo(perfil) {
  const trabajos = Array.isArray(perfil?.trabajos) ? perfil.trabajos : []
  return trabajos.find((trabajo) => trabajo?.activo) ?? null
}

/** Office (SGD name, when not null) and sede of a trabajo, or "Sin oficina". */
export function trabajoUbicacion(trabajo) {
  return [trabajo?.oficina, trabajo?.sede].filter(Boolean).join(' · ') || 'Sin oficina'
}

/** How many sistemas have a URL the portal can open. */
export function openableCount(sistemas) {
  return Array.isArray(sistemas) ? sistemas.filter((s) => safeHttpUrl(s?.url)).length : 0
}
