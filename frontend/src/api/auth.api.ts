// frontend/src/api/auth.api.ts
import apiClient from './client'

export const authApi = {
  register: (email: string, password: string) =>
    apiClient.post('/auth/register', { email, password }),

  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ access_token: string }>('/auth/login', {
      email,
      password,
    })
    // Stocke le token en localStorage
    localStorage.setItem('token', res.data.access_token)
    return res.data
  },

  logout: () => localStorage.removeItem('token'),
}
