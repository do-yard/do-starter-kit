import { NextResponse } from 'next/server';
import { StatusService } from '../../../services/status/statusService';

/**
 * Handles GET requests for the system status endpoint.
 * Checks all configured services dynamically and returns their status.
 * This endpoint is completely service-agnostic and will work with any services
 * returned by the StatusService.checkAllServices() method.
 * 
 * @returns {Promise<NextResponse>} JSON response with the status of all services and system info.
 */
export const GET = async () => {
  try {
    // Get status of all configured services
    const serviceStatus = await StatusService.checkAllServices();
    
    // Add system information to provide more context
    const systemInfo = {
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString()
    };

    // Determine overall system status
    const hasIssues = serviceStatus.some(service => !service.configured || !service.connected);
    
    return NextResponse.json({ 
      services: serviceStatus,
      systemInfo,
      status: hasIssues ? 'issues_detected' : 'ok'
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error checking system status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check system status',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
};
