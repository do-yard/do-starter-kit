import React from 'react';
import { Box, Card, CardContent, Typography, Alert, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface ServiceStatus {
  name: string;
  configured: boolean;
  connected: boolean;
  required: boolean;
  error?: string;
  configToReview?: string[];
}

interface ConfigurableServiceCardProps {
  service: ServiceStatus;
}

/**
 * Generic component for displaying the status of any configurable service.
 * This component is service-agnostic and renders based on the service status data.
 */
const ConfigurableServiceCard: React.FC<ConfigurableServiceCardProps> = ({ service }) => {
  const getConnectionIcon = () => {
    if (service.configured === false) {
      // Show gray circle with question mark for connection when not configured
      return (
        <Box sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: 'grey.400',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography variant="caption" sx={{ color: 'white', fontSize: '12px' }}>
            ?
          </Typography>
        </Box>
      );
    }

    return service.connected ? (
      <CheckCircleIcon color="success" />
    ) : (
      <ErrorIcon color="error" />
    );
  };

  const getConnectionStatus = () => {
    if (service.configured === false) {
      return 'Not tested';
    }
    return service.connected ? 'Successful' : 'Failed';
  };

  const getErrorMessage = () => {
    if (!service.error || !service.configToReview) {
      return service.error;
    }

    if (service.configured === false) {
      return `Missing settings: ${service.configToReview.join(', ')}`;
    } else {
      return `${service.error}. Please review the following settings: ${service.configToReview.join(', ')}`;
    }
  };
  const getErrorSeverity = () => {
    // For non-required services, show warnings instead of errors
    return service.required ? 'error' : 'warning';
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">
            {service.name}
          </Typography>
          <Chip
            label={service.required ? 'Required' : 'Optional'}
            color={service.required ? 'primary' : 'default'}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {service.configured ?
            <CheckCircleIcon color="success" /> :
            <ErrorIcon color="error" />}
          <Typography variant="body1" sx={{ ml: 1 }}>
            Configuration: {service.configured ? 'Valid' : 'Invalid'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: service.error ? 1 : 0 }}>
          {getConnectionIcon()}
          <Typography variant="body1" sx={{ ml: 1 }}>
            Connection: {getConnectionStatus()}
          </Typography>
        </Box>
        {service.error && (
          <Alert severity={getErrorSeverity()} sx={{ mt: 2 }}>
            <Typography variant="body2">
              {getErrorMessage()}
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ConfigurableServiceCard;
