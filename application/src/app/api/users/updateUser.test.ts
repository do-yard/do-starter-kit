import { HTTP_STATUS } from 'lib/api/http';
import { USER_ROLES } from 'lib/auth/roles';
import { updateUser } from './updateUser';
import { NextRequest } from 'next/server';
import { SubscriptionPlanEnum } from 'types';

const mockDbClient = {
  user: { update: jest.fn() },
  subscription: { update: jest.fn(), findByUserId: jest.fn() },
};
const mockBilling = {
  listSubscription: jest.fn(),
  updateSubscription: jest.fn(),
};

let mockGiftPriceId: string | undefined = 'pro_gift';
let mockFreePriceId: string | undefined = 'free';

jest.mock('services/billing/billing', () => ({
  createBillingService: () => mockBilling,
}));
jest.mock('settings', () => ({
  serverConfig: {
    Stripe: {
      get proGiftPriceId() {
        return mockGiftPriceId;
      },
      get freePriceId() {
        return mockFreePriceId;
      },
    },
  },
}));

jest.mock('../../../services/database/databaseFactory', () => ({
  createDatabaseService: () => Promise.resolve(mockDbClient),
}));

describe('updateUser', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockGiftPriceId = 'pro_gift';
    mockFreePriceId = 'free';
  });

  function makeRequest(body: Record<string, unknown>) {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  }

  it('returns 400 if no id is provided', async () => {
    const req = makeRequest({ name: 'Test' });
    const res = await updateUser(req);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await res.json()).toEqual({ error: 'User ID is required' });
  });

  it('returns 400 if no valid fields to update', async () => {
    const req = makeRequest({ id: 1, notAllowed: 'foo' });
    const res = await updateUser(req);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await res.json()).toEqual({ error: 'No valid fields to update' });
  });

  it('updates allowed fields and returns updated user', async () => {
    const updatedUser = { id: 1, name: 'New', role: USER_ROLES.ADMIN };
    mockDbClient.user.update.mockResolvedValue(updatedUser);
    const req = makeRequest({ id: 1, name: 'New', role: USER_ROLES.ADMIN });
    const res = await updateUser(req);
    expect(mockDbClient.user.update).toHaveBeenCalledWith(1, {
      name: 'New',
      role: USER_ROLES.ADMIN,
    });
    expect(res.status).toBe(HTTP_STATUS.OK);
    expect(await res.json()).toEqual({ user: updatedUser });
  });

  it('updates subscription to PRO (gift) if provided', async () => {
    mockDbClient.user.update.mockResolvedValue({ id: '1' });
    mockDbClient.subscription.findByUserId.mockResolvedValue([{ customerId: 'cus_1' }]);
    mockBilling.listSubscription.mockResolvedValue([{ id: 'sub_1', items: [{ id: 'item_1' }] }]);
    mockBilling.updateSubscription.mockResolvedValue({});
    const req = makeRequest({ id: '1', subscription: { plan: SubscriptionPlanEnum.PRO } });
    const res = await updateUser(req);
    expect(mockDbClient.subscription.findByUserId).toHaveBeenCalledWith('1');
    expect(mockBilling.listSubscription).toHaveBeenCalledWith('cus_1');
    expect(mockBilling.updateSubscription).toHaveBeenCalledWith('sub_1', 'item_1', 'pro_gift');
    expect(res.status).toBe(HTTP_STATUS.OK);
  });

  it('updates subscription to FREE if provided', async () => {
    mockDbClient.user.update.mockResolvedValue({ id: '1' });
    mockDbClient.subscription.findByUserId.mockResolvedValue([{ customerId: 'cus_1' }]);
    mockBilling.listSubscription.mockResolvedValue([{ id: 'sub_1', items: [{ id: 'item_1' }] }]);
    mockBilling.updateSubscription.mockResolvedValue({});
    const req = makeRequest({ id: '1', subscription: { plan: SubscriptionPlanEnum.FREE } });
    const res = await updateUser(req);
    expect(mockDbClient.subscription.findByUserId).toHaveBeenCalledWith('1');
    expect(mockBilling.listSubscription).toHaveBeenCalledWith('cus_1');
    expect(mockBilling.updateSubscription).toHaveBeenCalledWith('sub_1', 'item_1', 'free');
    expect(res.status).toBe(HTTP_STATUS.OK);
  });

  it('returns 404 if no existing subscription for PRO/FREE update', async () => {
    mockDbClient.user.update.mockResolvedValue({ id: 1 });
    mockDbClient.subscription.findByUserId.mockResolvedValue([]);
    const req = makeRequest({ id: 1, subscription: { plan: 'PRO' } });
    const res = await updateUser(req);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'No existing subscription found for user' });
  });

  it('returns 500 if proGiftPriceId is not configured', async () => {
    mockGiftPriceId = undefined;
    const req = makeRequest({ id: 1, subscription: { plan: 'PRO' } });
    const res = await updateUser(req);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Pro gift price ID is not configured' });
  });

  it('returns 500 if freePriceId is not configured', async () => {
    mockFreePriceId = undefined;
    const req = makeRequest({ id: 1, subscription: { plan: 'FREE' } });
    const res = await updateUser(req);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Free price ID is not configured' });
  });

  it('returns 500 on server error', async () => {
    mockDbClient.user.update.mockRejectedValue(new Error('fail'));
    const req = makeRequest({ id: 1, name: 'X' });
    const res = await updateUser(req);
    expect(res.status).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    expect(await res.json()).toEqual({ error: 'Internal server error' });
  });
});
