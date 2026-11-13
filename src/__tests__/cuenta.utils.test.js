import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  IDP_UNAVAILABLE_MESSAGE,
  formatFechaHora,
  orDash,
  passwordErrors,
  userAgentLabel,
  validatePasswordForm,
} from 'src/utils/cuenta'
import { trabajoUbicacion } from 'src/utils/portal'

const VALID = { password_actual: 'vieja', password: 'nueva-123', password_confirmar: 'nueva-123' }

describe('validatePasswordForm (Cambiar mi clave, client checks)', () => {
  it('accepts a complete form whose new passwords match and have 8+ characters', () => {
    expect(validatePasswordForm(VALID)).toEqual({})
    expect(
      validatePasswordForm({
        password_actual: 'x',
        password: '12345678',
        password_confirmar: '12345678',
      }),
    ).toEqual({})
  })

  it('requires the three fields', () => {
    expect(
      validatePasswordForm({ password_actual: '', password: '', password_confirmar: '' }),
    ).toEqual({
      password_actual: 'Ingresá tu contraseña actual.',
      password: 'Ingresá la nueva contraseña.',
      password_confirmar: 'Repetí la nueva contraseña.',
    })
    expect(validatePasswordForm({})).toEqual({
      password_actual: 'Ingresá tu contraseña actual.',
      password: 'Ingresá la nueva contraseña.',
      password_confirmar: 'Repetí la nueva contraseña.',
    })
  })

  it('requires at least 8 characters in the new password', () => {
    expect(
      validatePasswordForm({
        password_actual: 'x',
        password: '1234567',
        password_confirmar: '1234567',
      }),
    ).toEqual({ password: 'La nueva contraseña debe tener al menos 8 caracteres.' })
  })

  it('requires both new passwords to be equal', () => {
    expect(validatePasswordForm({ ...VALID, password_confirmar: 'nueva-124' })).toEqual({
      password_confirmar: 'Las contraseñas no coinciden.',
    })
  })
})

describe('passwordErrors (core responses of POST /api/me/password)', () => {
  it('puts the core field errors under their fields', () => {
    const error = {
      response: {
        status: 422,
        data: {
          message: 'La contraseña actual es incorrecta.',
          errors: { password_actual: ['La contraseña actual es incorrecta.'] },
        },
      },
    }
    expect(passwordErrors(error)).toEqual({
      fields: { password_actual: 'La contraseña actual es incorrecta.' },
      general: null,
    })

    const policy = {
      response: {
        status: 422,
        data: {
          message: 'La nueva contraseña no cumple la política.',
          errors: {
            password: ['La nueva contraseña no cumple la política.'],
            password_confirmar: ['Las contraseñas no coinciden.'],
          },
        },
      },
    }
    expect(passwordErrors(policy)).toEqual({
      fields: {
        password: 'La nueva contraseña no cumple la política.',
        password_confirmar: 'Las contraseñas no coinciden.',
      },
      general: null,
    })
  })

  it('shows a 422 without field errors as a general error', () => {
    const error = {
      response: { status: 422, data: { message: 'No se pudo cambiar la contraseña.' } },
    }
    expect(passwordErrors(error)).toEqual({
      fields: {},
      general: 'No se pudo cambiar la contraseña.',
    })
  })

  it('explains a 503 (identity provider down)', () => {
    const error = { response: { status: 503, data: { error: 'idp_unavailable' } } }
    expect(passwordErrors(error)).toEqual({ fields: {}, general: IDP_UNAVAILABLE_MESSAGE })
    expect(IDP_UNAVAILABLE_MESSAGE).toBe(
      'El servicio de acceso no está disponible. Intentá de nuevo en unos minutos.',
    )
  })

  it('uses a general message for network and other errors', () => {
    expect(passwordErrors(new Error('Network Error'))).toEqual({
      fields: {},
      general: 'No pudimos cambiar la contraseña. Intentá de nuevo en unos minutos.',
    })
    expect(passwordErrors({ response: { status: 403 } }).general).toBe(
      'Tu usuario está inactivo. Comunicate con el área de sistemas.',
    )
  })
})

describe('userAgentLabel (Últimos accesos)', () => {
  it('names the browser and the operating system', () => {
    expect(
      userAgentLabel(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      ),
    ).toBe('Chrome en Windows')
    expect(
      userAgentLabel(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.2478.80',
      ),
    ).toBe('Edge en Windows')
    expect(
      userAgentLabel(
        'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
      ),
    ).toBe('Firefox en Linux')
    expect(
      userAgentLabel(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
      ),
    ).toBe('Safari en macOS')
    expect(
      userAgentLabel(
        'Mozilla/5.0 (Linux; Android 14; SM-A146M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
      ),
    ).toBe('Chrome en Android')
    expect(
      userAgentLabel(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
      ),
    ).toBe('Safari en iOS')
    expect(
      userAgentLabel(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/109.0.0.0',
      ),
    ).toBe('Opera en Windows')
  })

  it('shows what it knows of an unknown user agent', () => {
    expect(userAgentLabel('curl/8.4.0')).toBe('Navegador desconocido')
    expect(userAgentLabel('SomeBot (Windows NT 10.0)')).toBe('Navegador desconocido en Windows')
  })

  it('renders a dash when the user agent is missing', () => {
    expect(userAgentLabel('')).toBe('—')
    expect(userAgentLabel('   ')).toBe('—')
    expect(userAgentLabel(null)).toBe('—')
  })
})

describe('formatFechaHora (local date and time)', () => {
  let previousTz
  beforeAll(() => {
    previousTz = process.env.TZ
    process.env.TZ = 'America/Lima'
  })
  afterAll(() => {
    if (previousTz === undefined) delete process.env.TZ
    else process.env.TZ = previousTz
  })

  it('formats an RFC3339 instant in the local time zone as DD/MM/YYYY HH:mm', () => {
    expect(formatFechaHora('2026-05-10T15:04:05Z')).toBe('10/05/2026 10:04')
    expect(formatFechaHora('2026-01-01T03:30:00+00:00')).toBe('31/12/2025 22:30')
  })

  it('renders a dash for missing or invalid values', () => {
    expect(formatFechaHora(null)).toBe('—')
    expect(formatFechaHora('')).toBe('—')
    expect(formatFechaHora('ayer')).toBe('—')
  })
})

describe('orDash', () => {
  it('keeps a value and renders a dash for null or blank', () => {
    expect(orDash('SGP')).toBe('SGP')
    expect(orDash('10.0.0.1')).toBe('10.0.0.1')
    expect(orDash(null)).toBe('—')
    expect(orDash(undefined)).toBe('—')
    expect(orDash('  ')).toBe('—')
  })
})

describe('trabajoUbicacion (Mi perfil office name)', () => {
  it('shows the SGD office name when it is not null, with the sede', () => {
    expect(trabajoUbicacion({ oficina: 'OFICINA DE TECNOLOGÍAS', sede: 'Palacio' })).toBe(
      'OFICINA DE TECNOLOGÍAS · Palacio',
    )
    expect(trabajoUbicacion({ oficina: 'OFICINA DE TECNOLOGÍAS', sede: null })).toBe(
      'OFICINA DE TECNOLOGÍAS',
    )
  })

  it('leaves the office out when it is null', () => {
    expect(trabajoUbicacion({ oficina: null, sede: 'Palacio' })).toBe('Palacio')
    expect(trabajoUbicacion({ oficina: null, sede: null })).toBe('Sin oficina')
  })
})
