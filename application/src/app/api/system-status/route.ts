import { NextResponse } from 'next/server';
import { StatusService } from '../../../services/status/statusService';
import { serverConfig } from '../../../../settings';
import { createStorageService } from '../../../services/storage/storage';

/**
 * Handles GET requests for the system status endpoint.
 * Checks all configured services (currently only storage) and returns their status.
 * 
 * @returns {Promise<NextResponse>} JSON response with the status of all services and system info.
 */
export const GET = async () => {  try {
    const serviceStatus = await StatusService.checkAllServices();
    
    // Add system information to provide more context
    const systemInfo = {
      storageProvider: serverConfig.storageProvider,
      environment: process.env.NODE_ENV || 'unknown',
      timestamp: new Date().toISOString()
    };    // Get configuration status from the storage service
    const storageService = createStorageService();
    const storageConfigStatus = await storageService.checkConfiguration();
    
    // Enhanced configuration diagnostics for better troubleshooting
    const configDiagnostics = { storageConfigStatus };
    
    const hasIssues = serviceStatus.some(service => !service.configured || !service.connected);
      return NextResponse.json({ 
      services: serviceStatus,
      systemInfo,
      configDiagnostics,
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
