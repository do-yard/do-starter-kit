import { Box, Typography, Button } from '@mui/material';

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
        Subscription To PRO Successful!
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
