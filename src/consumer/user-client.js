const axios = require('axios');

class UserClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getUser(userId) {
    const response = await axios.get(`${this.baseUrl}/users/${userId}`);
    return response.data;
  }

  async createUser(userData) {
    const response = await axios.post(`${this.baseUrl}/users`, userData, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  }

  async deleteUser(userId) {
    const response = await axios.delete(`${this.baseUrl}/users/${userId}`);
    return response.status;
  }
}

module.exports = { UserClient };
