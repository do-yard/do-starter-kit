import { handleSubscriptionUpdated } from './handleSubscriptionUpdated';
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from 'types';

const mockUpdateByCustomerId = jest.fn();

jest.mock('services/database/database', () => ({
  createDatabaseClient: () => ({
    subscription: {
      updateByCustomerId: mockUpdateByCustomerId,
    },
  }),
}));

let proPriceId: string | undefined = 'price_PRO';
jest.mock('../../../../settings', () => ({
  serverConfig: {
    Stripe: {
      get proPriceId() {
        return proPriceId;
      },
    },
  },
}));

describe('handleSubscriptionUpdated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    proPriceId = 'price_PRO';
  });

  it('throws if no customer ID', async () => {
    await expect(
      handleSubscriptionUpdated({
        data: { object: { customer: undefined, items: { data: [{ price: { id: 'any' } }] } } },
      })
    ).rejects.toThrow('Customer ID is required');
  });

  it('updates subscription as PRO and ACTIVE if price matches proPriceId', async () => {
    const json = {
      data: {
        object: {
          customer: 'cust_123',
          items: { data: [{ price: { id: 'price_PRO' } }] },
        },
      },
    };
    await handleSubscriptionUpdated(json);
    expect(mockUpdateByCustomerId).toHaveBeenCalledWith('cust_123', {
      status: SubscriptionStatusEnum.ACTIVE,
      plan: SubscriptionPlanEnum.PRO,
    });
  });

  it('does nothing if price does not match proPriceId', async () => {
    const json = {
      data: {
        object: {
          customer: 'cust_123',
          items: { data: [{ price: { id: 'price_FREE' } }] },
        },
      },
    };
    await handleSubscriptionUpdated(json);
    expect(mockUpdateByCustomerId).not.toHaveBeenCalled();
  });
});
