export class StripeClient {
  constructor(private baseURL = '/api/billing') {}

  async getSubscription(): Promise<{
    subscription: { id: string; status: string; items: { id: string; priceId: string }[] };
  }> {
    const res = await fetch(`${this.baseURL}/get-subscription`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to get subscription');
    return res.json();
  }

  async createSubscription(priceId: string): Promise<{ clientSecret: string }> {
    const res = await fetch(`${this.baseURL}/create-subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ priceId }),
    });
    if (!res.ok) throw new Error('Failed to create subscription');
    return res.json();
  }

  async cancelSubscription(): Promise<{ canceled: boolean }> {
    const res = await fetch(`${this.baseURL}/cancel-subscription`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to cancel subscription');
    return res.json();
  }

  async createCustomer(): Promise<{ customerId: string }> {
    const res = await fetch(`${this.baseURL}/create-customer`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to create customer');
    return res.json();
  }

  async updateToProSubscription(): Promise<{ clientSecret: string }> {
    const res = await fetch(`${this.baseURL}/upgrade-to-pro`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to update to pro');
    return res.json();
  }
}
