import apiClient from './axios'

export const shootingService = {
  async getSessions() {
    const response = await apiClient.get('/shooting-sessions/')
    return response.data
  },
  async createSession(sessionData) {
    const response = await apiClient.post('/shooting-sessions/', sessionData)
    return response.data
  },
  async deleteSession(id) {
    const response = await apiClient.delete(`/shooting-sessions/${id}/`)
    return response.data
  }
}