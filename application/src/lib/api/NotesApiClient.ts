import { ApiClient } from './apiClient';

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

export class NotesApiClient extends ApiClient {
  constructor() {
    super('/api/notes');
  }

  // Fetch all notes
  async getNotes(): Promise<Note[]> {
    const response = await this.client.get('/');
    return response.data;
  }

  // Fetch a specific note
  async getNote(id: string): Promise<Note> {
    const response = await this.client.get(`/${id}`);
    return response.data;
  }

  // Create a new note
  async createNote(noteData: CreateNoteData): Promise<Note> {
    const response = await this.client.post('/', noteData);
    return response.data;
  }

  // Update a note
  async updateNote(id: string, updateData: UpdateNoteData): Promise<Note> {
    const response = await this.client.put(`/${id}`, updateData);
    return response.data;
  }

  // Delete a note
  async deleteNote(id: string): Promise<void> {
    await this.client.delete(`/${id}`);
  }
}
