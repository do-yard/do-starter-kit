import { handleSubscriptionUpdated } from './handleSubscriptionUpdated';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';
import * as dbModule from 'services/database/database';

jest.mock('services/database/database', () => ({
  createDatabaseClient: jest.fn(),
}));

const mockUpdateByCustomerId = jest.fn();

jest.mock('services/billing/stripeBillingService', () => ({
  StripeBillingService: jest.fn().mockImplementation(() => ({
    setInvoicesActive: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    subscriptions: {
      update: jest.fn().mockResolvedValue({}),
    },
  }));
});

const makeEvent = (
  customer: string | undefined,
  priceId: string | undefined,
  subscriptionId = 'sub_123'
) => ({
  data: {
    object: {
      id: subscriptionId,
      customer,
      items: { data: [{ price: { id: priceId } }] },
    },
  },
});

const PRO_ID = 'pro_price_id';
const FREE_ID = 'free_price_id';

jest.mock('../../../../settings', () => ({
  serverConfig: {
    Stripe: {
      proPriceId: 'pro_price_id',
      freePriceId: 'free_price_id',
      stripeSecretKey: 'sk_test_123',
    },
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  (dbModule.createDatabaseClient as jest.Mock).mockReturnValue({
    subscription: { updateByCustomerId: mockUpdateByCustomerId },
  });
});

describe('handleSubscriptionUpdated', () => {
  it('sets plan to PRO if price matches proPriceId', async () => {
    await handleSubscriptionUpdated(makeEvent('cus_123', PRO_ID));
    expect(mockUpdateByCustomerId).toHaveBeenCalledWith('cus_123', {
      status: SubscriptionStatusEnum.ACTIVE,
      plan: SubscriptionPlanEnum.PRO,
    });
  });

  it('sets plan to FREE if price matches freePriceId', async () => {
    await handleSubscriptionUpdated(makeEvent('cus_456', FREE_ID));
    expect(mockUpdateByCustomerId).toHaveBeenCalledWith('cus_456', {
      status: SubscriptionStatusEnum.ACTIVE,
      plan: SubscriptionPlanEnum.FREE,
    });
  });

  it('throws if customerId is missing', async () => {
    await expect(handleSubscriptionUpdated(makeEvent(undefined, PRO_ID))).rejects.toThrow(
      /missing customer/
    );
    expect(mockUpdateByCustomerId).not.toHaveBeenCalled();
  });

  it('throws if priceId is missing', async () => {
    await expect(handleSubscriptionUpdated(makeEvent('cus_123', undefined))).rejects.toThrow(
      /missing price/
    );
    expect(mockUpdateByCustomerId).not.toHaveBeenCalled();
  });

  it('returns and does not update DB for unknown priceId', async () => {
    // Spy on console.warn to verify the warning is issued
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    await handleSubscriptionUpdated(makeEvent('cus_789', 'unknown_id'));
    expect(mockUpdateByCustomerId).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('unknown price ID: unknown_id'));
    warn.mockRestore();
  });
});
