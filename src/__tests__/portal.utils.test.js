import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SISTEMA_ICON,
  displayName,
  formatFecha,
  loadErrorMessage,
  safeHttpUrl,
  sistemaIcon,
} from 'src/utils/portal'

describe('safeHttpUrl', () => {
  it('accepts absolute http and https URLs', () => {
    expect(safeHttpUrl('https://transportes.munipuno.gob.pe')).toBe(
      'https://transportes.munipuno.gob.pe/',
    )
    expect(safeHttpUrl('  http://localhost:9000/admin  ')).toBe('http://localhost:9000/admin')
  })

  it('rejects anything that is not an absolute http(s) URL', () => {
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull()
    expect(safeHttpUrl('data:text/html,<script>1</script>')).toBeNull()
    expect(safeHttpUrl('ftp://example.com')).toBeNull()
    expect(safeHttpUrl('/relative/path')).toBeNull()
    expect(safeHttpUrl('transportes.munipuno.gob.pe')).toBeNull()
    expect(safeHttpUrl('')).toBeNull()
    expect(safeHttpUrl('   ')).toBeNull()
    expect(safeHttpUrl(null)).toBeNull()
    expect(safeHttpUrl(undefined)).toBeNull()
    expect(safeHttpUrl(42)).toBeNull()
  })
})

describe('sistemaIcon', () => {
  it('returns the trimmed icon name', () => {
    expect(sistemaIcon(' mdi-bus ')).toBe('mdi-bus')
  })

  it('falls back to the default icon', () => {
    expect(sistemaIcon('')).toBe(DEFAULT_SISTEMA_ICON)
    expect(sistemaIcon('  ')).toBe(DEFAULT_SISTEMA_ICON)
    expect(sistemaIcon(null)).toBe(DEFAULT_SISTEMA_ICON)
  })
})

describe('displayName', () => {
  const user = { name: 'aquispe', dni: '12345678' }

  it('prefers the persona full name', () => {
    expect(displayName({ user, persona: { nombre_completo: 'Ana Quispe Mamani' } })).toBe(
      'Ana Quispe Mamani',
    )
  })

  it('falls back to the user name, then the DNI', () => {
    expect(displayName({ user, persona: null })).toBe('aquispe')
    expect(displayName({ user: { dni: '12345678' }, persona: null })).toBe('12345678')
  })

  it('is empty without a profile', () => {
    expect(displayName(null)).toBe('')
  })
})

describe('formatFecha', () => {
  it('formats ISO dates as DD/MM/YYYY', () => {
    expect(formatFecha('1990-04-12')).toBe('12/04/1990')
    expect(formatFecha('1990-04-12T00:00:00.000000Z')).toBe('12/04/1990')
  })

  it('returns an empty string for missing or unknown values', () => {
    expect(formatFecha(null)).toBe('')
    expect(formatFecha('12/04/1990')).toBe('')
  })
})

describe('loadErrorMessage', () => {
  it('explains the statuses the core answers', () => {
    expect(loadErrorMessage({ response: { status: 403 } })).toBe(
      'Tu usuario está inactivo. Comunicate con el área de sistemas.',
    )
    expect(loadErrorMessage({ response: { status: 404 } })).toBe(
      'No encontramos tu usuario en el sistema de usuarios.',
    )
    expect(loadErrorMessage({ response: { status: 401 } })).toBe(
      'Tu sesión venció. Volvé a ingresar.',
    )
  })

  it('uses a generic message for network and server errors', () => {
    const generic = 'No pudimos cargar la información. Intentá de nuevo en unos minutos.'
    expect(loadErrorMessage(new Error('Network Error'))).toBe(generic)
    expect(loadErrorMessage({ response: { status: 500 } })).toBe(generic)
  })
})
