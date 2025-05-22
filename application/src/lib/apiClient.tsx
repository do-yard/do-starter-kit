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
  private client: AxiosInstance;

  constructor(baseURL = '/api') {
    this.client = axios.create({ baseURL });
  }

  async getUsers() {
    const response = await this.client.get('/users');
    return response.data;
  }

  // Update a user (PATCH /api/users)
  async updateUser(id: string, updateData: Partial<{ name: string; email: string; role: string }>) {
    const response = await this.client.patch('/users', { id, ...updateData });
    return response.data;
  }

  // Notes API methods

  // Fetch all notes (GET /api/notes)
  async getNotes(): Promise<Note[]> {
    const response = await this.client.get('/notes');
    return response.data;
  }

  // Fetch a specific note (GET /api/notes/:id)
  async getNote(id: string): Promise<Note> {
    const response = await this.client.get(`/notes/${id}`);
    return response.data;
  }

  // Create a new note (POST /api/notes)
  async createNote(noteData: CreateNoteData): Promise<Note> {
    const response = await this.client.post('/notes', noteData);
    return response.data;
  }

  // Update a note (PUT /api/notes/:id)
  async updateNote(id: string, updateData: UpdateNoteData): Promise<Note> {
    const response = await this.client.put(`/notes/${id}`, updateData);
    return response.data;
  }

  // Delete a note (DELETE /api/notes/:id)
  async deleteNote(id: string): Promise<void> {
    await this.client.delete(`/notes/${id}`);
  }
}
