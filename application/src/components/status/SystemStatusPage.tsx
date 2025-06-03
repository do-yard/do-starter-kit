'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Alert, CircularProgress, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

interface ServiceStatus {
  name: string;
  configured: boolean;
  connected: boolean;
  error?: string;
  configToReview?: string[];
}

interface SystemInfo {
  storageProvider: string;
  environment: string;
  timestamp: string;
}

/**
 * SystemStatusPage component for displaying the status of system services.
 * Simplified version that only shows if storage is configured and any missing environment variables.
 */
const SystemStatusPage: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [configDiagnostics, setConfigDiagnostics] = useState<any>(null);
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
      setServices(data.services);
      setSystemInfo(data.systemInfo);
      setConfigDiagnostics(data.configDiagnostics);
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

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          System Status
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Storage Service Configuration Status
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
                {hasIssues
                  ? services.some(s => !s.configured) 
                    ? "Missing Storage Configuration"
                    : "Storage Connection Failed"
                  : "Storage Service Operational"}
              </Typography>
              <Typography variant="body2">
                {hasIssues
                  ? services.some(s => !s.configured)
                    ? "Please check your environment variables below."
                    : "Configuration is valid but connection failed. Please verify credentials and network connectivity."
                  : "The storage service is properly configured and connected."}
              </Typography>
            </Box>
          </Alert>

          {/* Service Status Cards */}
          <Box sx={{ mb: 4 }}>
            {services.map((service) => (
              <Card key={service.name} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {service.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {service.configured ? 
                      <CheckCircleIcon color="success" /> : 
                      <ErrorIcon color="error" />}
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      Configuration: {service.configured ? 'Valid' : 'Invalid'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: service.error ? 1 : 0 }}>
                    {service.configured === false ? (
                      // Show gray for connection when not configured
                      <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'grey.400', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'white', fontSize: '12px' }}>?</Typography>
                      </Box>
                    ) : service.connected ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <ErrorIcon color="error" />
                    )}
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      Connection: {service.configured === false ? 'Not tested' : service.connected ? 'Successful' : 'Failed'}
                    </Typography>
                  </Box>
                  
                  {service.error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>
                        {service.configured === false 
                          ? `Missing settings: ${service.configToReview?.join(', ')}`
                          : `${service.error}. Please review the following settings: ${service.configToReview?.join(', ')}`
                        }
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
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
