import { defineStore } from 'pinia'
import { fetchMiPerfil, fetchMisSistemas } from 'src/services/me'
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
    /** Drop everything on logout so the next person never sees stale data. */
    clear() {
      this.$reset()
    },
  },
})
