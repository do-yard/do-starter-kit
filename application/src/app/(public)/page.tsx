import React from 'react';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import LockOutlineIcon from '@mui/icons-material/LockOutline';
import DnsIcon from '@mui/icons-material/Dns';
import RampLeftIcon from '@mui/icons-material/RampLeft';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { Button, Card, CardContent, Typography, Box } from '@mui/material';
import Link from 'next/link';

/**
 * Public landing page.
 * Present the main functionalities of the starter kit and CTA to get started.
 *
 * @returns Home page with visual presentation and call to action.
 */
const Home = () => (
  <Box sx={{ flexGrow: 1 }}>
    <Box
      sx={{
        background: 'linear-gradient(to right, #2563eb, #1e40af)',
        color: 'white',
        padding: '80px 0',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <Typography variant="h1">Launch Your SaaS on DigitalOcean</Typography>
      <Typography variant="subtitle1" sx={{ color: 'white' }}>
        A complete starter kit for building and deploying your SaaS application with ease.
      </Typography>
      <Button
        component={Link}
        href="/signup"
        prefetch={true}
        variant="contained"
        sx={{ borderRadius: 16, color: '#2563eb', bgcolor: 'white' }}
        endIcon={<TrendingFlatIcon sx={{ fontSize: 18 }} />}
      >
        Get Started
      </Button>
    </Box>

    <Box sx={{ padding: '80px 0', backgroundColor: 'black' }}>
      <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', backgroundColor: 'black' }}>
        <Typography variant="h2" align="center">
          Key Features
        </Typography>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 32,
          }}
        >
          <Card>
            <CardContent>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <CloudQueueIcon fontSize="large" color="primary" />
              </div>
              <Typography
                variant="h5"
                align="center"
                color="text.dark"
                fontWeight={600}
                gutterBottom
              >
                DigitalOcean Integration
              </Typography>
              <Typography align="center" color="text.medium">
                Seamlessly deploy your application to DigitalOcean&apos;s robust cloud
                infrastructure.
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <LockOutlineIcon fontSize="large" color="primary" />
              </div>
              <Typography
                variant="h5"
                align="center"
                color="text.dark"
                fontWeight={600}
                gutterBottom
              >
                Secure Authentication
              </Typography>
              <Typography align="center" color="text.medium">
                Built-in authentication system with email, Google, and GitHub login options.
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <ElectricBoltIcon fontSize="large" color="primary" />
              </div>
              <Typography
                variant="h5"
                align="center"
                color="text.dark"
                fontWeight={600}
                gutterBottom
              >
                Optimized Performance
              </Typography>
              <Typography align="center" color="text.medium">
                Leverage DigitalOcean&apos;s global network for lightning-fast load times and
                reliability.
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <DnsIcon fontSize="large" color="primary" />
              </div>
              <Typography
                variant="h5"
                align="center"
                color="text.dark"
                fontWeight={600}
                gutterBottom
              >
                Scalable Architecture
              </Typography>
              <Typography align="center" color="text.medium">
                Easily scale your application as your user base grows with DigitalOcean&apos;s
                flexible resources.
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <RampLeftIcon fontSize="large" color="primary" />
              </div>
              <Typography
                variant="h5"
                align="center"
                color="text.dark"
                fontWeight={600}
                gutterBottom
              >
                CI/CD Pipeline
              </Typography>
              <Typography align="center" color="text.medium">
                Integrated continuous integration and deployment pipeline for smooth updates.
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <CloudQueueIcon fontSize="large" color="primary" />
              </div>
              <Typography
                variant="h5"
                align="center"
                color="text.dark"
                fontWeight={600}
                gutterBottom
              >
                DigitalOcean Spaces
              </Typography>
              <Typography align="center" color="text.medium">
                Efficient file storage and CDN integration using DigitalOcean Spaces.
              </Typography>
            </CardContent>
          </Card>
        </div>
      </Box>
    </Box>

    <Box sx={{ background: '#f3f4f6', padding: '80px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', textAlign: 'center' }}>
        <Typography variant="h2" sx={{ color: '#374151', marginBottom: 2 }}>
          Ready to Launch Your SaaS?
        </Typography>
        <Typography variant="subtitle1" color="text.light">
          Get started with our DigitalOcean Starter Kit and bring your ideas to life.
        </Typography>
        <Button
          variant="contained"
          href="/signup"
          component={Link}
          prefetch={true}
          sx={{
            color: 'black',
            borderRadius: 16,
            bgcolor: 'white',
            '&:hover': { bgcolor: '#E9EAEF' },
          }}
        >
          Start Your Free Trial
        </Button>
      </div>
    </Box>
  </Box>
);

export const dynamic = 'force-dynamic';
export default Home;
