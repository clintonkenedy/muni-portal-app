import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('src/services/me', () => ({
  fetchMisSistemas: vi.fn(),
  fetchMiPerfil: vi.fn(),
}))

import { fetchMiPerfil, fetchMisSistemas } from 'src/services/me'
import { usePortalStore } from 'src/stores/portal'

const SISTEMA = {
  id: 2,
  nombre: 'Transportes',
  descripcion: 'Licencias',
  url: 'https://transportes.munipuno.gob.pe',
  icono: 'mdi-bus',
  roles: ['ADMIN'],
}
const PERFIL = { user: { id: 1, dni: '12345678', name: 'aquispe' }, persona: null, trabajos: [] }

describe('portal store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads the sistemas of the person', async () => {
    fetchMisSistemas.mockResolvedValue([SISTEMA])
    const portal = usePortalStore()

    await portal.loadSistemas()

    expect(portal.sistemas).toEqual([SISTEMA])
    expect(portal.sistemasLoaded).toBe(true)
    expect(portal.sistemasLoading).toBe(false)
    expect(portal.sistemasError).toBeNull()
  })

  it('keeps an empty list as loaded, so the page can show the empty state', async () => {
    fetchMisSistemas.mockResolvedValue([])
    const portal = usePortalStore()

    await portal.loadSistemas()

    expect(portal.sistemas).toEqual([])
    expect(portal.sistemasLoaded).toBe(true)
  })

  it('reports a failed load and keeps the previous list', async () => {
    const portal = usePortalStore()
    fetchMisSistemas.mockResolvedValue([SISTEMA])
    await portal.loadSistemas()

    fetchMisSistemas.mockRejectedValue({ response: { status: 500 } })
    await portal.loadSistemas()

    expect(portal.sistemasError).toBe(
      'No pudimos cargar la información. Intentá de nuevo en unos minutos.',
    )
    expect(portal.sistemas).toEqual([SISTEMA])
    expect(portal.sistemasLoading).toBe(false)
  })

  it('clears a previous error when a retry succeeds', async () => {
    const portal = usePortalStore()
    fetchMisSistemas.mockRejectedValue(new Error('Network Error'))
    await portal.loadSistemas()
    expect(portal.sistemasError).not.toBeNull()

    fetchMisSistemas.mockResolvedValue([SISTEMA])
    await portal.loadSistemas()

    expect(portal.sistemasError).toBeNull()
    expect(portal.sistemas).toEqual([SISTEMA])
  })

  it('loads the profile and reports its own failure separately', async () => {
    const portal = usePortalStore()
    fetchMiPerfil.mockResolvedValue(PERFIL)
    await portal.loadPerfil()
    expect(portal.perfil).toEqual(PERFIL)
    expect(portal.perfilError).toBeNull()

    fetchMiPerfil.mockRejectedValue({ response: { status: 403 } })
    await portal.loadPerfil()

    expect(portal.perfilError).toBe('Tu usuario está inactivo. Comunicate con el área de sistemas.')
    expect(portal.perfilLoading).toBe(false)
    expect(portal.sistemasError).toBeNull()
  })

  it('drops everything on clear (logout)', async () => {
    const portal = usePortalStore()
    fetchMisSistemas.mockResolvedValue([SISTEMA])
    fetchMiPerfil.mockResolvedValue(PERFIL)
    await portal.loadSistemas()
    await portal.loadPerfil()

    portal.clear()

    expect(portal.sistemas).toEqual([])
    expect(portal.sistemasLoaded).toBe(false)
    expect(portal.perfil).toBeNull()
  })
})
