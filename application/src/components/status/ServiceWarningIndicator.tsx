'use client';

import React, { useEffect, useState } from 'react';
import { IconButton, Tooltip, Badge } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useRouter } from 'next/navigation';

interface ServiceStatus {
  name: string;
  configured: boolean;
  connected: boolean;
  required: boolean;
  error?: string;
}

/**
 * Component that shows a warning indicator in the header when optional services have issues.
 * Only displays when there are optional service failures but no required service failures.
 */
const ServiceWarningIndicator: React.FC = () => {
  const [hasOptionalIssues, setHasOptionalIssues] = useState(false);
  const [optionalIssuesCount, setOptionalIssuesCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkServiceStatus = async () => {
      try {
        const response = await fetch('/api/system-status');
        if (response.ok) {
          const data = await response.json();
          const services: ServiceStatus[] = data.services || [];

          // Check for issues in required vs optional services
          const requiredServices = services.filter((service) => service.required);
          const optionalServices = services.filter((service) => !service.required);

          const hasRequiredIssues = requiredServices.some(
            (service) => !service.configured || !service.connected
          );
          const optionalIssues = optionalServices.filter(
            (service) => !service.configured || !service.connected
          );

          // Only show warning if there are optional issues but no required issues
          setHasOptionalIssues(!hasRequiredIssues && optionalIssues.length > 0);
          setOptionalIssuesCount(optionalIssues.length);
        }
      } catch (error) {
        console.error('Failed to check service status:', error);
        // Don't show warning if we can't check status
        setHasOptionalIssues(false);
      }
    };

    // Check immediately
    checkServiceStatus();

    // Check every 5 minutes
    const interval = setInterval(checkServiceStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    router.push('/system-status');
  };

  if (!hasOptionalIssues) {
    return null;
  }

  return (
    <Tooltip
      title={`${optionalIssuesCount} optional service${optionalIssuesCount !== 1 ? 's' : ''} have configuration issues. Click to view details.`}
    >
      <IconButton
        onClick={handleClick}
        sx={{
          color: 'warning.main',
          '&:hover': {
            backgroundColor: 'warning.light',
            color: 'warning.dark',
          },
        }}
      >
        <Badge badgeContent={optionalIssuesCount} color="warning">
          <WarningIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

export default ServiceWarningIndicator;
