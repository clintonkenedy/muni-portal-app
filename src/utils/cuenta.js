import { loadErrorMessage } from 'src/utils/portal'

// Pure helpers of the account pages: Cambiar mi clave, Últimos accesos, Mis sesiones.

export const DASH = '—'
export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_FIELDS = ['password_actual', 'password', 'password_confirmar']
export const PASSWORD_UPDATED_MESSAGE = 'Contraseña actualizada correctamente.'
export const IDP_UNAVAILABLE_MESSAGE =
  'El servicio de acceso no está disponible. Intentá de nuevo en unos minutos.'
const PASSWORD_FAILED_MESSAGE =
  'No pudimos cambiar la contraseña. Intentá de nuevo en unos minutos.'

function isBlank(value) {
  return typeof value !== 'string' || value === ''
}

/**
 * Client checks of the "Cambiar mi clave" form, run before sending: every
 * field required, new password of 8+ characters, both new passwords equal.
 *
 * @returns {Record<string,string>} one message per invalid field; empty when valid.
 */
export function validatePasswordForm(form) {
  const errors = {}
  if (isBlank(form?.password_actual)) errors.password_actual = 'Ingresá tu contraseña actual.'
  if (isBlank(form?.password)) errors.password = 'Ingresá la nueva contraseña.'
  else if (form.password.length < PASSWORD_MIN_LENGTH)
    errors.password = `La nueva contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`
  if (isBlank(form?.password_confirmar)) errors.password_confirmar = 'Repetí la nueva contraseña.'
  else if (!errors.password && form.password_confirmar !== form.password)
    errors.password_confirmar = 'Las contraseñas no coinciden.'
  return errors
}

/**
 * Maps a failed `POST /api/me/password` to the form: Laravel field errors go
 * under their fields; a 422 without field errors, a 503 and anything else
 * become one general message.
 *
 * @returns {{fields: Record<string,string>, general: string|null}}
 */
export function passwordErrors(error) {
  const status = error?.response?.status
  const data = error?.response?.data
  if (status === 422) {
    const fields = {}
    const errors = data?.errors && typeof data.errors === 'object' ? data.errors : {}
    for (const field of PASSWORD_FIELDS) {
      const messages = errors[field]
      const first = Array.isArray(messages) ? messages[0] : messages
      if (typeof first === 'string' && first) fields[field] = first
    }
    if (Object.keys(fields).length > 0) return { fields, general: null }
    return { fields: {}, general: data?.message || PASSWORD_FAILED_MESSAGE }
  }
  if (status === 503) return { fields: {}, general: IDP_UNAVAILABLE_MESSAGE }
  if (status === 401 || status === 403 || status === 404) {
    return { fields: {}, general: loadErrorMessage(error) }
  }
  return { fields: {}, general: PASSWORD_FAILED_MESSAGE }
}

/** The value, or a dash when it is null, undefined or blank. */
export function orDash(value) {
  if (value === null || value === undefined) return DASH
  const text = String(value).trim()
  return text === '' ? DASH : text
}

function pad(number) {
  return String(number).padStart(2, '0')
}

/** RFC3339 instant → local `DD/MM/YYYY HH:mm`; a dash when missing or invalid. */
export function formatFechaHora(value) {
  if (typeof value !== 'string' || value.trim() === '') return DASH
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return DASH
  return (
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  )
}

// Order matters: Chromium-based browsers also say "Chrome" and "Safari".
const BROWSERS = [
  ['Edge', /\bEdg(e|A|iOS)?\//],
  ['Opera', /\bOPR\/|\bOpera\b/],
  ['Firefox', /\bFirefox\/|\bFxiOS\//],
  ['Chrome', /\bChrome\/|\bCriOS\//],
  ['Safari', /\bVersion\/[\d.]+.*\bSafari\//],
]

// Android before Linux and iOS before macOS ("like Mac OS X").
const SYSTEMS = [
  ['Windows', /\bWindows\b/],
  ['Android', /\bAndroid\b/],
  ['iOS', /\b(iPhone|iPad|iPod)\b/],
  ['ChromeOS', /\bCrOS\b/],
  ['macOS', /\bMacintosh\b|\bMac OS X\b/],
  ['Linux', /\bLinux\b/],
]

function firstMatch(list, text) {
  const found = list.find(([, pattern]) => pattern.test(text))
  return found ? found[0] : null
}

/** Short browser/OS label of a user agent ("Chrome en Windows"); a dash when missing. */
export function userAgentLabel(userAgent) {
  if (typeof userAgent !== 'string' || userAgent.trim() === '') return DASH
  const browser = firstMatch(BROWSERS, userAgent) || 'Navegador desconocido'
  const system = firstMatch(SYSTEMS, userAgent)
  return system ? `${browser} en ${system}` : browser
}
