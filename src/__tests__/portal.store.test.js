import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('src/services/me', () => ({
  fetchMisSistemas: vi.fn(),
  fetchMiPerfil: vi.fn(),
  fetchMisAccesos: vi.fn(),
  fetchMisSesiones: vi.fn(),
  closeAllMySesiones: vi.fn(),
}))

import {
  closeAllMySesiones,
  fetchMiPerfil,
  fetchMisAccesos,
  fetchMisSesiones,
  fetchMisSistemas,
} from 'src/services/me'
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

  describe('Últimos accesos', () => {
    const ACCESO = {
      fecha: '2026-05-10T15:04:05Z',
      ip: '10.0.0.1',
      user_agent: 'Mozilla/5.0',
      sistema: 'SGP',
      exitoso: true,
    }

    it('loads the accesos, and keeps an empty list as loaded (empty state)', async () => {
      const portal = usePortalStore()
      fetchMisAccesos.mockResolvedValue([ACCESO])
      await portal.loadAccesos()
      expect(portal.accesos).toEqual([ACCESO])
      expect(portal.accesosLoaded).toBe(true)
      expect(portal.accesosLoading).toBe(false)
      expect(portal.accesosError).toBeNull()

      fetchMisAccesos.mockResolvedValue([])
      await portal.loadAccesos()
      expect(portal.accesos).toEqual([])
      expect(portal.accesosLoaded).toBe(true)
    })

    it('reports a failed load (503) and clears it when a retry succeeds', async () => {
      const portal = usePortalStore()
      fetchMisAccesos.mockRejectedValue({
        response: { status: 503, data: { error: 'idp_unavailable' } },
      })
      await portal.loadAccesos()
      expect(portal.accesosError).toBe(
        'No pudimos cargar la información. Intentá de nuevo en unos minutos.',
      )
      expect(portal.accesosLoaded).toBe(false)
      expect(portal.accesosLoading).toBe(false)

      fetchMisAccesos.mockResolvedValue([ACCESO])
      await portal.loadAccesos()
      expect(portal.accesosError).toBeNull()
      expect(portal.accesos).toEqual([ACCESO])
    })
  })

  describe('Mis sesiones', () => {
    const SESION = { sistema: 'SGP', desde: '2026-05-10T15:04:05Z' }

    it('loads the sesiones, and keeps an empty list as loaded (empty state)', async () => {
      const portal = usePortalStore()
      fetchMisSesiones.mockResolvedValue([SESION])
      await portal.loadSesiones()
      expect(portal.sesiones).toEqual([SESION])
      expect(portal.sesionesLoaded).toBe(true)
      expect(portal.sesionesError).toBeNull()

      fetchMisSesiones.mockResolvedValue([])
      await portal.loadSesiones()
      expect(portal.sesiones).toEqual([])
      expect(portal.sesionesLoaded).toBe(true)
    })

    it('reports a failed load (503) and clears it when a retry succeeds', async () => {
      const portal = usePortalStore()
      fetchMisSesiones.mockRejectedValue({
        response: { status: 503, data: { error: 'hydra_unavailable' } },
      })
      await portal.loadSesiones()
      expect(portal.sesionesError).toBe(
        'No pudimos cargar la información. Intentá de nuevo en unos minutos.',
      )
      expect(portal.sesionesLoading).toBe(false)

      fetchMisSesiones.mockResolvedValue([SESION])
      await portal.loadSesiones()
      expect(portal.sesionesError).toBeNull()
    })

    it('closes every session and reports success', async () => {
      const portal = usePortalStore()
      closeAllMySesiones.mockResolvedValue(true)

      await expect(portal.closeAllSesiones()).resolves.toBe(true)

      expect(closeAllMySesiones).toHaveBeenCalledTimes(1)
      expect(portal.closingSesiones).toBe(false)
      expect(portal.closeSesionesError).toBeNull()
    })

    it('reports a failed close (503) and keeps the list', async () => {
      const portal = usePortalStore()
      fetchMisSesiones.mockResolvedValue([SESION])
      await portal.loadSesiones()
      closeAllMySesiones.mockRejectedValue({
        response: { status: 503, data: { error: 'hydra_unavailable' } },
      })

      await expect(portal.closeAllSesiones()).resolves.toBe(false)

      expect(portal.closeSesionesError).toBe(
        'No pudimos cerrar las sesiones. Intentá de nuevo en unos minutos.',
      )
      expect(portal.closingSesiones).toBe(false)
      expect(portal.sesiones).toEqual([SESION])
    })
  })
})
