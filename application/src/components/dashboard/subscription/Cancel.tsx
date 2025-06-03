import { Box, Button, Typography } from '@mui/material';

/**
 * Subscription cancellation page component.
 * Displays a message indicating the subscription was cancelled and provides a button to return to the dashboard.
 * @returns Page with subscription cancellation UI
 */
export default function Cancel() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Typography variant="h3" fontWeight="bold" mb={4}>
        Subscription Cancelled
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={2}>
        There was an issue with your subscription upgrade to Pro.
      </Typography>
      <Button href="/dashboard" variant="contained" color="primary" size="large" sx={{ mt: 4 }}>
        Go to Dashboard
      </Button>
    </Box>
  );
}
