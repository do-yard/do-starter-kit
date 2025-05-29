/**
 * API client for sending emails via the backend email API.
 */
export class ApiClient {
  constructor(private baseURL = '/api') {}

  // Fetch all users (GET /api/users)
  async testEmail(to: string) {
    const res = await fetch(this.baseURL + '/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: to }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to send email');
    }
  }
}