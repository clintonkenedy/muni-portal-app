import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('src/boot/axios', () => ({
  apiCore: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

import { apiCore } from 'src/boot/axios'
import {
  changeMyPassword,
  closeAllMySesiones,
  fetchMiPerfil,
  fetchMisAccesos,
  fetchMisSesiones,
} from 'src/services/me'

describe('me service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('changeMyPassword', () => {
    it('posts the three fields to /api/me/password and returns the core message', async () => {
      apiCore.post.mockResolvedValue({
        status: 200,
        data: { message: 'Contraseña actualizada correctamente.' },
      })
      const form = {
        password_actual: 'vieja',
        password: 'nueva-123',
        password_confirmar: 'nueva-123',
      }

      await expect(changeMyPassword(form)).resolves.toBe('Contraseña actualizada correctamente.')

      expect(apiCore.post).toHaveBeenCalledWith('/api/me/password', {
        password_actual: 'vieja',
        password: 'nueva-123',
        password_confirmar: 'nueva-123',
      })
    })

    it('falls back to the spec message when the core sends none', async () => {
      apiCore.post.mockResolvedValue({ status: 200, data: {} })

      await expect(
        changeMyPassword({ password_actual: 'a', password: 'b', password_confirmar: 'b' }),
      ).resolves.toBe('Contraseña actualizada correctamente.')
    })

    it('rejects with the axios error on 422 and 503', async () => {
      const error = { response: { status: 503, data: { error: 'idp_unavailable' } } }
      apiCore.post.mockRejectedValue(error)

      await expect(
        changeMyPassword({ password_actual: 'a', password: 'b', password_confirmar: 'b' }),
      ).rejects.toBe(error)
    })
  })

  describe('fetchMisAccesos', () => {
    it('returns the list of /api/me/accesos in the core order', async () => {
      const data = [
        {
          fecha: '2026-05-10T15:04:05Z',
          ip: '10.0.0.1',
          user_agent: 'x',
          sistema: 'SGP',
          exitoso: true,
        },
        { fecha: '2026-05-09T15:04:05Z', ip: null, user_agent: '', sistema: null, exitoso: false },
      ]
      apiCore.get.mockResolvedValue({ data: { data } })

      await expect(fetchMisAccesos()).resolves.toEqual(data)
      expect(apiCore.get).toHaveBeenCalledWith('/api/me/accesos')
    })

    it('returns an empty list when the core sends no data', async () => {
      apiCore.get.mockResolvedValue({ data: {} })
      await expect(fetchMisAccesos()).resolves.toEqual([])
    })
  })

  describe('fetchMisSesiones', () => {
    it('returns the list of /api/me/sesiones', async () => {
      const data = [
        { sistema: 'SGP', desde: '2026-05-10T15:04:05Z' },
        { sistema: null, desde: null },
      ]
      apiCore.get.mockResolvedValue({ data: { data } })

      await expect(fetchMisSesiones()).resolves.toEqual(data)
      expect(apiCore.get).toHaveBeenCalledWith('/api/me/sesiones')
    })

    it('returns an empty list when the core sends no data', async () => {
      apiCore.get.mockResolvedValue({ data: { data: null } })
      await expect(fetchMisSesiones()).resolves.toEqual([])
    })
  })

  describe('closeAllMySesiones', () => {
    it('sends DELETE /api/me/sesiones and resolves when the core revoked them', async () => {
      apiCore.delete.mockResolvedValue({ data: { sessions_revoked: true } })

      await expect(closeAllMySesiones()).resolves.toBe(true)
      expect(apiCore.delete).toHaveBeenCalledWith('/api/me/sesiones')
    })

    it('rejects on 503 hydra_unavailable', async () => {
      const error = { response: { status: 503, data: { error: 'hydra_unavailable' } } }
      apiCore.delete.mockRejectedValue(error)

      await expect(closeAllMySesiones()).rejects.toBe(error)
    })
  })

  describe('fetchMiPerfil', () => {
    it('keeps the SGD office name of each trabajo, string or null', async () => {
      const trabajos = [
        { cargo: 'Analista', oficina: 'OFICINA DE TECNOLOGÍAS', sede: 'Palacio', activo: true },
        { cargo: 'Antiguo', oficina: null, sede: null, activo: false },
      ]
      apiCore.get.mockResolvedValue({ data: { user: { dni: '1' }, persona: null, trabajos } })

      const perfil = await fetchMiPerfil()

      expect(perfil.trabajos).toEqual(trabajos)
      expect(apiCore.get).toHaveBeenCalledWith('/api/me/perfil')
    })
  })
})
