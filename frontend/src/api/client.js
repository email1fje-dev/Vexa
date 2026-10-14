import axios from 'axios'
import {
  LOGIN_PAGE,
  LOGIN_URL,
  REFRESH_TOKEN_URL,
} from '../constants/history.constants'

const AUTH_FUNCTION_URL = 'https://txnisvhvacftvndzsnwa.supabase.co/functions/v1/vexa-auth'
const AUTH_PUBLIC_KEY = 'sb_publishable_UX6cddk5gQa1gpPIZ2xFDg_Ox9JlNhf'
const AUTH_ROUTE = /\/api\/v1\/auth\/(login|register|refresh-tokens|logout)([?#].*)?$/i

axios.defaults.withCredentials = true

const client = axios.create({
  baseURL: process.env.API_URL || '',
  withCredentials: true,
})

client.interceptors.request.use(
  function (config) {
    const rawUrl = String(config.url || '')
    const authMatch = rawUrl.match(AUTH_ROUTE)

    // Route sign-in flows through the Vexa Supabase Edge Function.
    // This avoids depending on inline XHR patches in the static HTML page.
    if (authMatch) {
      config.baseURL = ''
      config.url =
        AUTH_FUNCTION_URL +
        '/api/v1/auth/' +
        authMatch[1].toLowerCase() +
        (authMatch[2] || '')
      config.headers = config.headers || {}
      config.headers.apikey = AUTH_PUBLIC_KEY
      config.headers.Authorization = 'Bearer ' + AUTH_PUBLIC_KEY
      return config
    }

    try {
      const stored = localStorage.getItem('user')
      const userStorage = stored ? JSON.parse(stored) : null
      const token = userStorage && userStorage.tokens && userStorage.tokens.access
        ? userStorage.tokens.access.token
        : null
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = 'Bearer ' + token
      }
    } catch (error) {
      // Ignore corrupted local storage and let the API return a useful error.
      localStorage.removeItem('user')
    }
    return config
  },
  (error) => Promise.reject(error)
)

client.interceptors.response.use(
  (response) => response,
  async (err) => {
    const response = err && err.response
    const originalReq = err && err.config
    if (!response) return Promise.reject(err)

    const requestUrl = String((originalReq && originalReq.url) || '')
    const isAuthRequest =
      requestUrl.includes('/functions/v1/vexa-auth/') || AUTH_ROUTE.test(requestUrl)

    // Rejected login/register requests must not trigger token refresh.
    if (isAuthRequest) return Promise.reject(err)

    const status = response.status

    if (originalReq && requestUrl !== LOGIN_URL && status === 401) {
      if (response.data && response.data.message === 'Token not found') {
        localStorage.removeItem('user')
        window.location.replace(LOGIN_PAGE)
        return Promise.reject(err)
      }

      if (
        response.data &&
        response.data.message === 'Please authenticate' &&
        !originalReq._retry
      ) {
        originalReq._retry = true
        let userStorage = null
        try {
          userStorage = JSON.parse(localStorage.getItem('user') || 'null')
        } catch (error) {
          localStorage.removeItem('user')
        }
        const refreshToken = userStorage && userStorage.tokens && userStorage.tokens.refresh
          ? userStorage.tokens.refresh.token
          : null

        if (!refreshToken) {
          localStorage.removeItem('user')
          window.location.replace(LOGIN_PAGE)
          return Promise.reject(err)
        }

        try {
          const refreshed = await client.post(REFRESH_TOKEN_URL, { refreshToken })
          localStorage.setItem('user', JSON.stringify(refreshed.data))
          originalReq.headers = originalReq.headers || {}
          const accessToken = refreshed.data && refreshed.data.tokens && refreshed.data.tokens.access
            ? refreshed.data.tokens.access.token
            : ''
          originalReq.headers.Authorization = 'Bearer ' + accessToken
          return client(originalReq)
        } catch (refreshError) {
          localStorage.removeItem('user')
          window.location.replace(LOGIN_PAGE)
          return Promise.reject(refreshError)
        }
      }
    }

    if (status === 403) {
      localStorage.removeItem('user')
      window.location.replace(LOGIN_PAGE)
    }

    return Promise.reject(err)
  }
)

export default client
