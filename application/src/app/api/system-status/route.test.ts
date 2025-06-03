import { NextRequest } from 'next/server';
import { GET } from './route';
import { StatusService } from '../../../services/status/statusService';

jest.mock('../../../services/status/statusService');

describe('System Status API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return status of all services', async () => {
    // Arrange
    const mockServices = [
      {
        name: 'DigitalOcean Spaces',
        configured: true,
        connected: true,
      },
    ];

    (StatusService.checkAllServices as jest.Mock).mockResolvedValue(mockServices);

    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data).toEqual({ services: mockServices });
    expect(StatusService.checkAllServices).toHaveBeenCalledTimes(1);
  });

  it('should return error when service check fails', async () => {
    // Arrange
    (StatusService.checkAllServices as jest.Mock).mockRejectedValue(new Error('Test error'));

    // Act
    const response = await GET();
    const data = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to check system status' });
  });
});
