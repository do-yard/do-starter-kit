import axios, { AxiosInstance } from 'axios';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL = '/api') {
    this.client = axios.create({ baseURL });
  }

  // Fetch all users (GET /api/users)
  async getUsers() {
    const response = await this.client.get('/users');
    return response.data;
  }

  // Update a user (PATCH /api/users)
  async updateUser(id: string, updateData: Partial<{ name: string; email: string; role: string }>) {
    const response = await this.client.patch('/users', { id, ...updateData });
    return response.data;
  }
}