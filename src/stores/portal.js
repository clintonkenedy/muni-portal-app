import { defineStore } from 'pinia'
import {
  closeAllMySesiones,
  fetchMiPerfil,
  fetchMisAccesos,
  fetchMisSesiones,
  fetchMisSistemas,
} from 'src/services/me'
import { loadErrorMessage } from 'src/utils/portal'

/**
 * Data of the signed-in person shown by the portal. Each resource keeps its
 * own loading/error state so one failing request does not blank the other.
 */
export const usePortalStore = defineStore('portal', {
  state: () => ({
    sistemas: [],
    sistemasLoading: false,
    sistemasLoaded: false,
    sistemasError: null,
    perfil: null,
    perfilLoading: false,
    perfilError: null,
    accesos: [],
    accesosLoading: false,
    accesosLoaded: false,
    accesosError: null,
    sesiones: [],
    sesionesLoading: false,
    sesionesLoaded: false,
    sesionesError: null,
    closingSesiones: false,
    closeSesionesError: null,
  }),
  actions: {
    async loadSistemas() {
      this.sistemasLoading = true
      this.sistemasError = null
      try {
        this.sistemas = await fetchMisSistemas()
        this.sistemasLoaded = true
      } catch (error) {
        this.sistemasError = loadErrorMessage(error)
      } finally {
        this.sistemasLoading = false
      }
    },
    async loadPerfil() {
      this.perfilLoading = true
      this.perfilError = null
      try {
        this.perfil = await fetchMiPerfil()
      } catch (error) {
        this.perfilError = loadErrorMessage(error)
      } finally {
        this.perfilLoading = false
      }
    },
    async loadAccesos() {
      this.accesosLoading = true
      this.accesosError = null
      try {
        this.accesos = await fetchMisAccesos()
        this.accesosLoaded = true
      } catch (error) {
        this.accesosError = loadErrorMessage(error)
      } finally {
        this.accesosLoading = false
      }
    },
    async loadSesiones() {
      this.sesionesLoading = true
      this.sesionesError = null
      try {
        this.sesiones = await fetchMisSesiones()
        this.sesionesLoaded = true
      } catch (error) {
        this.sesionesError = loadErrorMessage(error)
      } finally {
        this.sesionesLoading = false
      }
    },
    /**
     * "Cerrar todas las sesiones". Resolves true when the core revoked them;
     * the caller then ends the portal's own session.
     */
    async closeAllSesiones() {
      this.closingSesiones = true
      this.closeSesionesError = null
      try {
        await closeAllMySesiones()
        return true
      } catch {
        this.closeSesionesError =
          'No pudimos cerrar las sesiones. Intentá de nuevo en unos minutos.'
        return false
      } finally {
        this.closingSesiones = false
      }
    },
    /** Drop everything on logout so the next person never sees stale data. */
    clear() {
      this.$reset()
    },
  },
})
