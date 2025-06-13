import React from 'react';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import LockOutlineIcon from '@mui/icons-material/LockOutlined';
import DnsIcon from '@mui/icons-material/Dns';
import RampLeftIcon from '@mui/icons-material/RampLeft';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { Button, Card, CardContent, Typography, Box, Container, Stack } from '@mui/material';
import Link from 'next/link';

interface FeatureCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
}

/**
 * FeatureCard component to display individual feature cards.
 */
const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <Card>
    <CardContent>
      <Stack alignItems="center" textAlign="center">
        <Box color="primary.main">
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<{ style?: React.CSSProperties }>, {
                style: { fontSize: 36 },
              })
            : icon}
        </Box>
        <Typography variant="h6" component="h3" fontWeight="bold">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>
    </CardContent>
  </Card>
);

const features: FeatureCardProps[] = [
  {
    icon: <CloudQueueIcon sx={{ color: '#0ea5e9' }} fontSize="large" />, // Sky blue for cloud
    title: 'DigitalOcean Integration',
    description:
      "Seamlessly deploy your application to DigitalOcean's robust cloud infrastructure.",
  },
  {
    icon: <LockOutlineIcon sx={{ color: '#dc2626' }} fontSize="large" />, // Red for security/lock
    title: 'Secure Authentication',
    description: 'Built-in authentication system with email, Google, and GitHub login options.',
  },
  {
    icon: <ElectricBoltIcon sx={{ color: '#f59e0b' }} fontSize="large" />, // Golden/amber for lightning/energy
    title: 'Optimized Performance',
    description:
      "Leverage DigitalOcean's global network for lightning-fast load times and reliability.",
  },
  {
    icon: <DnsIcon sx={{ color: '#16a34a' }} fontSize="large" />, // Green for growth/scalability
    title: 'Scalable Architecture',
    description:
      "Easily scale your application as your user base grows with DigitalOcean's flexible resources.",
  },
  {
    icon: <RampLeftIcon sx={{ color: '#7c3aed' }} fontSize="large" />, // Purple for automation/pipeline
    title: 'CI/CD Pipeline',
    description: 'Integrated continuous integration and deployment pipeline for smooth updates.',
  },
  {
    icon: <CloudQueueIcon sx={{ color: '#0ea5e9' }} fontSize="large" />, // Sky blue for cloud storage
    title: 'DigitalOcean Spaces',
    description: 'Efficient file storage and CDN integration using DigitalOcean Spaces.',
  },
];

/**
 * Home page component for the DigitalOcean SaaS starter kit.
 */
const Home = () => (
  <Box>
    {/* Hero Section */}
    <Box bgcolor="background.default" py={4}>
      <Container maxWidth="md">
        <Stack spacing={3} textAlign="center">
          <Typography variant="h1" component="h1" fontWeight="bold">
            Launch Your SaaS on DigitalOcean
          </Typography>
          <Typography variant="h5" component="p">
            A complete starter kit for building and deploying your SaaS application with ease.
          </Typography>
          <Box>
            <Button
              component={Link}
              href="/signup"
              prefetch={true}
              variant="contained"
              size="large"
              endIcon={<TrendingFlatIcon />}
              sx={{
                backgroundColor: '#000000',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#333333',
                },
              }}
            >
              Get Started Free
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>

    {/* Features Section */}
    <Box py={6} bgcolor="background.default">
      <Container maxWidth="lg">
        <Stack spacing={6}>
          <Stack spacing={2} textAlign="center">
            <Typography variant="h2" component="h2" fontWeight="bold">
              Key Features
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {features.map((feature, idx) => (
              <FeatureCard key={feature.title + idx} {...feature} />
            ))}
          </Box>
        </Stack>
      </Container>
    </Box>

    {/* CTA Section */}
    <Box py={8} bgcolor="background.default">
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center">
          <Card
            sx={{
              maxWidth: 800,
              width: '100%',
              py: 6,
              px: 4,
              textAlign: 'center',
              boxShadow: 3,
            }}
          >
            <CardContent>
              <Stack spacing={4}>
                <Typography variant="h2" component="h2" fontWeight="bold">
                  Ready to Launch Your SaaS?
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Get started with our DigitalOcean Starter Kit and bring your ideas to life.
                </Typography>
                <Box>
                  <Button
                    variant="contained"
                    href="/signup"
                    component={Link}
                    prefetch={true}
                    size="large"
                    sx={{
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#333333',
                      },
                      py: 2,
                      px: 4,
                    }}
                  >
                    Start Taking Notes Today
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  </Box>
);

export const dynamic = 'force-dynamic';
export default Home;
