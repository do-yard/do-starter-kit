import { GET } from './route';

describe('Health Check API', () => {
  it('returns status ok', async () => {
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ status: 'ok' });
  });
});
