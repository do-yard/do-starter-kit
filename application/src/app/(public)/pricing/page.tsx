import { Box, Button, Card, CardContent, Typography, List, ListItem } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import Link from 'next/link';
import { createBillingService } from 'services/billing/billingFactory';

export const dynamic = 'force-dynamic'; // Ensure this page is always revalidated

/**
 * Renders the pricing page with available subscription plans.
 */
export default async function PricingPage() {
  const billingService = await createBillingService();
  const plans = await billingService.getProducts();

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        px: 2,
        py: 6,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Choose your Plan
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 4,
          mt: 4,
        }}
      >
        {plans.map((plan) => (
          <Card key={plan.priceId} elevation={3} sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h2" gutterBottom>
                {plan.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography sx={{ mb: 2, mr: 1, fontSize: '3rem', fontWeight: 700 }} gutterBottom>
                  ${plan.amount}
                </Typography>
                <Typography variant="h4" gutterBottom>
                  /{plan.interval}
                </Typography>
              </Box>
              <Typography variant="subtitle1" gutterBottom>
                {plan.description}
              </Typography>
              <List>
                {plan.features.map((feature, index) => (
                  <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                    <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="subtitle1">{feature}</Typography>
                  </ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                fullWidth
                component={Link}
                href="/signup"
                sx={{
                  mt: 2,
                  bgcolor: 'black',
                  color: 'white',
                  '&:hover': { bgcolor: '#333' },
                }}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
