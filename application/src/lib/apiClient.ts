import axios, { AxiosInstance } from 'axios';

export class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL = '/api') {
    this.client = axios.create({ baseURL });
  }

  // Fetch all users (GET /api/users)
  async getUsers(params?: { page?: number; pageSize?: number; searchName?: string; filterPlan?: string; filterStatus?: string }) {
    const query: Record<string, string> = {};
    if (params) {
      if (params.page) query.page = String(params.page);
      if (params.pageSize) query.pageSize = String(params.pageSize);
      if (params.searchName) query.searchName = params.searchName;
      if (params.filterPlan) query.filterPlan = params.filterPlan;
      if (params.filterStatus) query.filterStatus = params.filterStatus;
    }
    const response = await this.client.get('/users', { params: query });
    return response.data;
  }

  // Update a user (PATCH /api/users)
  async updateUser(id: string, updateData: Partial<{ name: string; email: string; role: string }>) {
    const response = await this.client.patch('/users', { id, ...updateData });
    return response.data;
  }
}