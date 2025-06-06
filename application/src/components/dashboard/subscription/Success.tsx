import { Box, Typography, Button } from '@mui/material';
import { SubscriptionPlanEnum } from 'types';

/**
 * Subscription success page component.
 * Displays a message indicating the subscription was successful and provides a button to return to the dashboard.
 * @returns Page with subscription success UI
 */
export default function Success() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Typography variant="h3" fontWeight="bold" mb={4}>
        Welcome to {SubscriptionPlanEnum.PRO}!
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={6}>
        Thank you for subscribing to our service.
      </Typography>
      <Button href="/dashboard" variant="contained" color="primary" size="large">
        Go to Dashboard
      </Button>
    </Box>
  );
}
