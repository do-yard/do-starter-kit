'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Alert, CircularProgress, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import ConfigurableServiceCard from './ConfigurableServiceCard';

interface ServiceStatus {
  name: string;
  configured: boolean;
  connected: boolean;
  error?: string;
  configToReview?: string[];
}

interface SystemInfo {
  environment: string;
  timestamp: string;
}

/**
 * Generic SystemStatusPage component for displaying the status of all configured services.
 * This component is service-agnostic and renders any services returned by the API.
 */
const SystemStatusPage: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/system-status');
      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`);
      }
      
      const data = await response.json();
      setServices(data.services || []);
      setSystemInfo(data.systemInfo);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching system status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const hasIssues = services.some(service => !service.configured || !service.connected);
  const unconfiguredServices = services.filter(service => !service.configured);
  const configuredButDisconnectedServices = services.filter(service => service.configured && !service.connected);

  const getOverallStatusMessage = () => {
    if (!hasIssues) {
      return {
        title: "All Services Operational",
        description: "All configured services are properly configured and connected."
      };
    }
    
    if (unconfiguredServices.length > 0) {
      return {
        title: "Missing Service Configuration",
        description: "Some services are missing required configuration. Please check the details below."
      };
    }
    
    if (configuredButDisconnectedServices.length > 0) {
      return {
        title: "Service Connection Issues",
        description: "Services are configured but connection failed. Please verify credentials and network connectivity."
      };
    }
    
    return {
      title: "Service Issues Detected",
      description: "Please review the service status details below."
    };
  };
  const statusMessage = getOverallStatusMessage();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          System Status
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Service Configuration and Connectivity Status
        </Typography>
        {lastUpdated && (
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
            Last checked: {lastUpdated.toLocaleString()}
          </Typography>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Alert 
            severity={hasIssues ? "warning" : "success"} 
            sx={{ mb: 3 }}
            icon={hasIssues ? <ErrorIcon /> : <CheckCircleIcon />}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6">
                {statusMessage.title}
              </Typography>
              <Typography variant="body2">
                {statusMessage.description}
              </Typography>
            </Box>
          </Alert>

          {/* Service Status Cards */}
          <Box sx={{ mb: 4 }}>
            {services.length === 0 ? (
              <Alert severity="info">
                No services configured for status checking.
              </Alert>
            ) : (
              services.map((service, index) => (
                <ConfigurableServiceCard key={`${service.name}-${index}`} service={service} />
              ))
            )}
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<RefreshIcon />}
              onClick={fetchStatus} 
              sx={{ mr: 2 }}
              disabled={loading}
            >
              Refresh Status
            </Button>
            <Button 
              variant="outlined"
              startIcon={<HomeIcon />}
              href="/"
              disabled={loading}
            >
              Return Home
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default SystemStatusPage;
