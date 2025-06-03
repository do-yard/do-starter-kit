'use client';

import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Alert, CircularProgress, Button, Chip, Divider } from '@mui/material';
import { Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HelpIcon from '@mui/icons-material/Help';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import StorageIcon from '@mui/icons-material/Storage';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';

interface ServiceStatus {
  name: string;
  configured: boolean;
  connected: boolean;
  error?: string;
  warning?: string;
}

interface SystemInfo {
  storageProvider: string;
  environment: string;
  timestamp: string;
}

const StatusIndicator: React.FC<{ status: boolean | null }> = ({ status }) => {
  if (status === null) {
    return <HelpIcon sx={{ color: 'grey' }} />;
  }
  return status ? (
    <CheckCircleIcon color="success" />
  ) : (
    <ErrorIcon color="error" />
  );
};

/**
 * SystemStatusPage component for displaying the status of all system services.
 */
const SystemStatusPage: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [configDiagnostics, setConfigDiagnostics] = useState<any>(null);
  const [overallStatus, setOverallStatus] = useState<string>('');
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
      setOverallStatus(data.status);
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
          Check the status of all system services and their connectivity.
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
                  ? "System Configuration Issues Detected"
                  : "All Systems Operational"}
              </Typography>
              <Typography variant="body2">
                {hasIssues
                  ? "There are configuration issues that need to be addressed before using the application."
                  : "All required services are properly configured and connected."}
              </Typography>
            </Box>
          </Alert>

          {systemInfo && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  System Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Storage Provider
                    </Typography>
                    <Typography variant="body2">
                      {systemInfo.storageProvider}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Environment
                    </Typography>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {systemInfo.environment}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      System Time
                    </Typography>
                    <Typography variant="body2">
                      {new Date(systemInfo.timestamp).toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          <Box sx={{ mb: 4 }}>
            {services.map((service) => (
              <Card key={service.name} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {service.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <StatusIndicator status={service.configured} />
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      Configuration: {service.configured ? 'Valid' : 'Invalid'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: (service.error || service.warning) ? 1 : 0 }}>
                    <StatusIndicator status={service.connected} />
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      Connection: {service.connected ? 'Successful' : 'Failed'}
                    </Typography>
                  </Box>
                  
                  {service.error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {service.error}
                    </Alert>
                  )}
                  
                  {service.warning && !service.error && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      {service.warning}
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>

          {hasIssues && (
            <Box sx={{ mb: 4 }}>
              <Card sx={{ mb: 4, bgcolor: 'background.paper' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Troubleshooting
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    To resolve configuration issues, follow these steps:
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      1. Check your environment variables
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      <li>
                        <Typography variant="body2">
                          Verify that all required environment variables are set in your <code>.env</code> file
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          Compare your environment variables with <code>env-example</code> to ensure none are missing
                        </Typography>
                      </li>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      2. For Storage issues
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      <li>
                        <Typography variant="body2">
                          Check that <code>STORAGE_PROVIDER</code> is set correctly (e.g., <code>Spaces</code>)
                        </Typography>
                      </li>
                      <li>
                        <Typography variant="body2">
                          For DigitalOcean Spaces:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2 }}>
                          <li>Verify your access keys are correct: <code>SPACES_KEY</code> and <code>SPACES_SECRET</code></li>
                          <li>Confirm bucket name matches: <code>SPACES_BUCKET</code> or <code>SPACES_BUCKETNAME</code></li>
                          <li>Check region and endpoint: <code>SPACES_REGION</code> and <code>SPACES_ENDPOINT</code></li>
                          <li>Test connection to the bucket using the DigitalOcean console</li>
                        </Box>
                      </li>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      3. Configuration Diagnostics
                    </Typography>
                    
                    {configDiagnostics && (
                      <>
                        <Box sx={{ pl: 2, mb: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Environment Variables:
                          </Typography>
                          
                          <Box component="ul" sx={{ pl: 2 }}>
                            {Object.entries(configDiagnostics.envVarsPresent).map((entry) => {
                              const key = entry[0];
                              const present = Boolean(entry[1]);
                              return (
                                <li key={key}>
                                  <Typography variant="body2" sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    color: present ? 'success.main' : 'error.main'
                                  }}>
                                    {present ? (
                                      <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                                    ) : (
                                      <ErrorIcon fontSize="small" sx={{ mr: 1 }} />
                                    )}
                                    <code>{key}</code>: {present ? 'Present' : 'Missing'}
                                  </Typography>
                                </li>
                              );
                            })}
                          </Box>
                        </Box>
                        
                        <Box sx={{ pl: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Config Values:
                          </Typography>
                          
                          <Box component="ul" sx={{ pl: 2 }}>
                            {Object.entries(configDiagnostics.configValuesPresent).map((entry) => {
                              const key = entry[0];
                              const present = Boolean(entry[1]);
                              return (
                                <li key={key}>
                                  <Typography variant="body2" sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    color: present ? 'success.main' : 'error.main'
                                  }}>
                                    {present ? (
                                      <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                                    ) : (
                                      <ErrorIcon fontSize="small" sx={{ mr: 1 }} />
                                    )}
                                    <code>{key}</code>: {present ? 'Valid' : 'Missing or Invalid'}
                                  </Typography>
                                </li>
                              );
                            })}
                          </Box>
                        </Box>
                      </>
                    )}
                    
                    {!configDiagnostics && (
                      <Typography variant="body2" sx={{ pl: 2 }}>
                        Detailed diagnostics not available. Please refresh the status page.
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      4. After fixing issues
                    </Typography>
                    <Typography variant="body2">
                      Once you've updated your configuration, restart your application and click the "Refresh Status" button below.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

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
