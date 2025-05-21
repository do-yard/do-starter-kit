'use client';
import React from 'react';
import { Person, Receipt, Settings, CreditCard, Logout } from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  styled,
} from '@mui/material';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SidebarLink = ({ href, icon, children }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        component={Link}
        href={href}
        selected={isActive}
        sx={{
          borderRadius: 1,
          py: 1,
          px: 1.5,
          color: isActive ? 'grey.50' : 'grey.300',
          bgcolor: isActive ? 'grey.800' : 'transparent',
          '&:hover': {
            bgcolor: 'grey.800',
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 36,
            color: 'inherit',
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={children}
          primaryTypographyProps={{
            fontSize: 14,
            fontWeight: 500,
          }}
        />
      </ListItemButton>
    </ListItem>
  );
};

const SidebarHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '3.5rem',
  padding: theme.spacing(0, 2),
  borderBottom: '1px solid',
  borderColor: '#1f2937',
}));

const DashboardSidebar = () => {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 256,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 256,
          boxSizing: 'border-box',
          bgcolor: '#030712',
          color: '#fff',
          borderRight: 1,
          borderColor: '#1f2937',
        },
      }}
    >
      <SidebarHeader>
        <Typography variant="h5" fontWeight={600} color="grey.300">
          SaaS App
        </Typography>
      </SidebarHeader>

      <Box sx={{ p: 2, flex: 1, overflowY: 'auto' }}>
        <List sx={{ p: 0 }}>
          <SidebarLink href="/dashboard" icon={<Person fontSize="small" />}>
            Dashboard
          </SidebarLink>
          <SidebarLink href="/dashboard/my-notes" icon={<Receipt fontSize="small" />}>
            My Notes
          </SidebarLink>
        </List>
      </Box>

      <Divider sx={{ borderColor: '#1f2937' }} />

      <Box sx={{ p: 2 }}>
        <List sx={{ p: 0 }}>
          <SidebarLink href="/dashboard/account" icon={<Settings fontSize="small" />}>
            Account Settings
          </SidebarLink>
          <SidebarLink href="/dashboard/billing" icon={<CreditCard fontSize="small" />}>
            Billing
          </SidebarLink>
          <SidebarLink href="/logout" icon={<Logout fontSize="small" />}>
            Logout
          </SidebarLink>
        </List>
      </Box>
    </Drawer>
  );
};

export default DashboardSidebar;
