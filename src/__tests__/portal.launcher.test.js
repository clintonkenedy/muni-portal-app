import { describe, expect, it } from 'vitest'
import {
  activeTrabajo,
  filterSistemas,
  firstName,
  initials,
  normalizeText,
  openableCount,
  rolesSummary,
} from 'src/utils/portal'

const TRANSPORTES = {
  id: 1,
  nombre: 'SIS-TRANSPORTES',
  descripcion: 'Sistema de transportes',
  url: 'https://transportes.munipuno.gob.pe',
  roles: ['ADMINISTRADOR - OTI'],
}
const SGP = {
  id: 2,
  nombre: 'SGP',
  descripcion: 'Gestión de Personal',
  url: 'https://sgp.munipuno.gob.pe',
  roles: ['Administrador SGP', 'Consulta SGP'],
}
const ECONOMICAS = {
  id: 3,
  nombre: 'Actividades Económicas',
  descripcion: null,
  url: null,
  roles: [],
}
const SISTEMAS = [TRANSPORTES, SGP, ECONOMICAS]

describe('normalizeText', () => {
  it('lowercases, trims and removes accents', () => {
    expect(normalizeText('  Económicas ÁÉÍÓÚ Ñandú ')).toBe('economicas aeiou nandu')
  })

  it('is empty for anything that is not text', () => {
    expect(normalizeText(null)).toBe('')
    expect(normalizeText(undefined)).toBe('')
    expect(normalizeText(42)).toBe('')
  })
})

describe('filterSistemas', () => {
  it('returns every sistema for an empty or blank query', () => {
    expect(filterSistemas(SISTEMAS, '')).toEqual(SISTEMAS)
    expect(filterSistemas(SISTEMAS, '   ')).toEqual(SISTEMAS)
    expect(filterSistemas(SISTEMAS, null)).toEqual(SISTEMAS)
  })

  it('matches the name ignoring case and accents', () => {
    expect(filterSistemas(SISTEMAS, 'economicas')).toEqual([ECONOMICAS])
    expect(filterSistemas(SISTEMAS, 'TRANSPORTES')).toEqual([TRANSPORTES])
  })

  it('matches the description', () => {
    expect(filterSistemas(SISTEMAS, 'gestion')).toEqual([SGP])
  })

  it('matches the role names', () => {
    expect(filterSistemas(SISTEMAS, 'consulta')).toEqual([SGP])
    expect(filterSistemas(SISTEMAS, 'administrador')).toEqual([TRANSPORTES, SGP])
  })

  it('requires every word of the query', () => {
    expect(filterSistemas(SISTEMAS, 'administrador oti')).toEqual([TRANSPORTES])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterSistemas(SISTEMAS, 'tributos')).toEqual([])
  })

  it('tolerates a missing list', () => {
    expect(filterSistemas(null, 'x')).toEqual([])
  })
})

describe('rolesSummary', () => {
  it('returns the first role and how many more there are', () => {
    expect(rolesSummary(['Administrador SGP', 'Consulta SGP', 'Otro'])).toEqual({
      first: 'Administrador SGP',
      extra: 2,
    })
    expect(rolesSummary(['Operador'])).toEqual({ first: 'Operador', extra: 0 })
  })

  it('has no first role without roles', () => {
    expect(rolesSummary([])).toEqual({ first: null, extra: 0 })
    expect(rolesSummary(undefined)).toEqual({ first: null, extra: 0 })
  })
})

describe('firstName', () => {
  it('uses the first given name of the persona', () => {
    expect(firstName({ persona: { nombres: 'DORIS YANET' } })).toBe('Doris')
  })

  it('falls back to the first word of the display name', () => {
    expect(firstName({ persona: { nombre_completo: 'ana quispe' }, user: {} })).toBe('Ana')
    expect(firstName({ persona: null, user: { name: 'aquispe' } })).toBe('Aquispe')
    expect(firstName(null, 'Juan Pérez')).toBe('Juan')
  })

  it('is empty when the name is unknown', () => {
    expect(firstName(null)).toBe('')
    expect(firstName(null, '')).toBe('')
  })
})

describe('initials', () => {
  it('uses the first given name and the first surname of the persona', () => {
    expect(
      initials({
        persona: {
          nombres: 'Doris Yanet',
          apellido_paterno: 'Laura',
          nombre_completo: 'DORIS YANET LAURA MAMANI',
        },
      }),
    ).toBe('DL')
  })

  it('falls back to the first two words of the name', () => {
    expect(initials(null, 'ana quispe mamani')).toBe('AQ')
    expect(initials({ persona: null, user: { name: 'aquispe' } })).toBe('A')
  })

  it('is empty when the name is unknown', () => {
    expect(initials(null)).toBe('')
  })
})

describe('activeTrabajo', () => {
  it('returns the first active trabajo', () => {
    const activo = { cargo: 'Administrador - OTI', activo: true }
    expect(activeTrabajo({ trabajos: [{ cargo: 'Antiguo', activo: false }, activo] })).toBe(activo)
  })

  it('is null without an active trabajo', () => {
    expect(activeTrabajo({ trabajos: [{ cargo: 'Antiguo', activo: false }] })).toBeNull()
    expect(activeTrabajo(null)).toBeNull()
  })
})

describe('openableCount', () => {
  it('counts the sistemas with a valid URL', () => {
    expect(openableCount(SISTEMAS)).toBe(2)
    expect(openableCount([{ url: 'javascript:alert(1)' }])).toBe(0)
  })

  it('is zero without sistemas', () => {
    expect(openableCount(undefined)).toBe(0)
  })
})
