/**
 * API client for sending emails via the backend email API.
 */
export class EmailClient {
  constructor(private baseURL = '/api') {}

  // Send test emails for testing email integration feature (POST /api/email)
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