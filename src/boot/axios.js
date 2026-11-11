import axios from 'axios'

// Core API (muni-usuarios). The Authorization header is attached by
// @munipuno/hydra-auth-vue in src/boot/hydraAuth.js.
const apiCore = axios.create({ baseURL: process.env.API_CORE_URL })

export { apiCore }
