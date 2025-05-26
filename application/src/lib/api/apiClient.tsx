import axios, { AxiosInstance } from 'axios';

export class ApiClient {
  protected client: AxiosInstance;

  constructor(baseURL = '/api') {
    this.client = axios.create({ baseURL });
  }
}
