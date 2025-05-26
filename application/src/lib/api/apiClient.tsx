import axios, { AxiosInstance } from 'axios';

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
}

export class ApiClient {
  protected client: AxiosInstance;

  constructor(baseURL = '/api') {
    this.client = axios.create({ baseURL });
  }
}
