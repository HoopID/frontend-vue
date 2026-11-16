import apiClient from './axios'

export const matchService = {
  async getMatches() {
    const response = await apiClient.get('/matches')
    return response.data
  },
  async createMatch(data) {
    const response = await apiClient.post('/matches', data)
    return response.data
  },
  async updateMatch(id, data) {
    const response = await apiClient.put(`/matches/${id}`, data)
    return response.data
  },
  async deleteMatch(id) {
    const response = await apiClient.delete(`/matches/${id}`)
    return response.data
  },
  async getMonthlyStats(year) {
    const response = await apiClient.get('/matches/stats/monthly', { params: year ? { year } : {} })
    return response.data
  }
}
