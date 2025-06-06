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
  required: boolean;
  error?: string;
  configToReview?: string[];
}

interface SystemInfo {
  environment: string;
  timestamp: string;
  lastHealthCheck: string;
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

  const fetchStatus = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = forceRefresh ? '/api/system-status?refresh=true' : '/api/system-status';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Status page received data:', data);
      setServices(data.services || []);
      setSystemInfo(data.systemInfo);
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

  const requiredServices = services.filter(service => service.required);
  const optionalServices = services.filter(service => !service.required);

  const hasRequiredIssues = requiredServices.some(service => !service.configured || !service.connected);
  const hasOptionalIssues = optionalServices.some(service => !service.configured || !service.connected);

  const unconfiguredRequiredServices = requiredServices.filter(service => !service.configured);
  const configuredButDisconnectedRequiredServices = requiredServices.filter(service => service.configured && !service.connected);
  
  const getOverallStatusMessage = () => {
    if (!hasRequiredIssues && !hasOptionalIssues) {
      return {
        title: "All Services Operational",
        description: "All configured services are properly configured and connected.",
        severity: "success" as const
      };
    }

    if (hasRequiredIssues) {
      if (unconfiguredRequiredServices.length > 0) {
        return {
          title: "Critical Services Missing Configuration",
          description: "Required services are missing configuration. The application cannot function properly until these are resolved.",
          severity: "error" as const
        };
      }

      if (configuredButDisconnectedRequiredServices.length > 0) {
        return {
          title: "Critical Service Connection Issues",
          description: "Required services are configured but connection failed. Please verify credentials and network connectivity.",
          severity: "error" as const
        };
      }
    }

    if (hasOptionalIssues && !hasRequiredIssues) {
      return {
        title: "Optional Services Have Issues",
        description: "Some optional services have configuration or connection issues, but the application can still function.",
        severity: "warning" as const
      };
    }

    return {
      title: "Service Issues Detected",
      description: "Please review the service status details below.",
      severity: "warning" as const
    };
  };
  
  const statusMessage = getOverallStatusMessage();

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          System Status
        </Typography>        <Typography variant="body1" color="text.secondary">
          Service Configuration and Connectivity Status
        </Typography>
        {systemInfo?.lastHealthCheck && (
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
            Last checked: {new Date(systemInfo.lastHealthCheck).toLocaleString()}
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
        <>          <Alert
          severity={statusMessage.severity}
          sx={{ mb: 3 }}
          icon={statusMessage.severity === "success" ? <CheckCircleIcon /> : <ErrorIcon />}
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
          </Box>          <Box sx={{ textAlign: 'center' }}>            <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => fetchStatus(true)}
            sx={{ mr: hasRequiredIssues ? 0 : 2 }}
            disabled={loading}
          >
            Refresh Status
          </Button>
            {!hasRequiredIssues && (
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                href="/"
                disabled={loading}
              >
                Return Home
              </Button>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default SystemStatusPage;
