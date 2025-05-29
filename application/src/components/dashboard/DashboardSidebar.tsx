'use client';
import React, { useCallback } from 'react';
import { Person, Receipt, Settings, CreditCard, Logout, Assessment } from '@mui/icons-material';
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
  Avatar,
} from '@mui/material';
import { useSession, signOut } from 'next-auth/react';

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

const SidebarLink = ({ href, icon, children, onClick }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        component={Link}
        prefetch={true}
        href={href}
        onClick={onClick}
        selected={isActive}
        sx={{
          borderRadius: 1,
          py: 1,
          px: 1.5
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 36
          }}
        >
          {icon}
        </ListItemIcon>
        <ListItemText
          primary={children}
          sx={{
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
  borderBottom: `1px solid ${theme.palette.divider}`
}));

const DashboardSidebar = () => {
  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };
  const session = useSession();

  const getProfileIcon = useCallback(() => {
    const url = session.data?.user?.image ?? undefined;
    return <Avatar src={url} alt="User Avatar" />;
  }, [session]);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 256,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 256,
          boxSizing: 'border-box',
          borderRight: 1,
          borderColor: 'divider'
        },
      }}
    >
      <SidebarHeader justifyContent={'space-between'}>
        <Typography variant="h5" fontWeight={600}>
          SaaS App
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getProfileIcon()}
        </Box>
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

      <Divider/>

      <Box sx={{ p: 2 }}>
        <List sx={{ p: 0 }}>
          {session.data?.user?.role === 'ADMIN' && (
            <SidebarLink href="/admin/dashboard" icon={<Assessment fontSize="small" />}>
              Admin Dashboard
            </SidebarLink>
          )}
          <SidebarLink href="/dashboard/account" icon={<Settings fontSize="small" />}>
            Account Settings
          </SidebarLink>
          <SidebarLink href="/dashboard/billing" icon={<CreditCard fontSize="small" />}>
            Billing
          </SidebarLink>
          <SidebarLink href="#" onClick={handleLogout} icon={<Logout fontSize="small" />}>
            Logout
          </SidebarLink>
        </List>
      </Box>
    </Drawer>
  );
};

export default DashboardSidebar;
