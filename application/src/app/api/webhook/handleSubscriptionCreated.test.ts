import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';
import { handleSubscriptionCreated } from './handleSubscriptionCreated';

// Mocks

const mockUpdateByCustomerId = jest.fn();
jest.mock('services/database/database', () => ({
  createDatabaseClient: () => ({
    subscription: { updateByCustomerId: mockUpdateByCustomerId },
  }),
}));

const proPriceId = 'pro_price_id';
jest.mock('../../../../settings', () => ({
  serverConfig: {
    Stripe: {
      get proPriceId() {
        return proPriceId;
      },
    },
  },
}));

describe('handleSubscriptionCreated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates subscription to ACTIVE and PRO if priceId matches proPriceId', async () => {
    const json = {
      data: {
        object: {
          customer: 'cus_123',
          items: { data: [{ price: { id: proPriceId } }] },
        },
      },
    };
    await handleSubscriptionCreated(json);
    expect(mockUpdateByCustomerId).toHaveBeenCalledWith('cus_123', {
      status: SubscriptionStatusEnum.ACTIVE,
      plan: SubscriptionPlanEnum.PRO,
    });
  });

  it('updates subscription to ACTIVE only if priceId does not match proPriceId', async () => {
    const json = {
      data: {
        object: {
          customer: 'cus_456',
          items: { data: [{ price: { id: 'other_price_id' } }] },
        },
      },
    };
    await handleSubscriptionCreated(json);
    expect(mockUpdateByCustomerId).toHaveBeenCalledWith('cus_456', {
      status: SubscriptionStatusEnum.ACTIVE,
    });
  });

  it('throws if customerId is missing', async () => {
    const json = {
      data: {
        object: {
          items: { data: [{ price: { id: proPriceId } }] },
        },
      },
    };
    await expect(handleSubscriptionCreated(json)).rejects.toThrow('Customer ID is required');
    expect(mockUpdateByCustomerId).not.toHaveBeenCalled();
  });
});
