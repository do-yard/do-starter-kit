import React from 'react';
import { Paper as MuiPaper, styled } from '@mui/material';
import { SxProps, Theme } from '@mui/material/styles';

// Styled Paper component with dark theme styling
const PaperRoot = styled(MuiPaper)(({ theme }) => ({
  backgroundColor: '#030712',
  color: '#fff',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid #374151',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
  overflow: 'hidden',
}));

interface PaperProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  fullWidth?: boolean; // New prop to control if Paper should use 100% width
}

// Wrapper component that allows for additional sx props
/**
 *
 */
const Paper: React.FC<PaperProps> = ({ children, sx = {}, fullWidth = false }) => {
  return (
    <PaperRoot
      elevation={0}
      sx={{
        maxWidth: fullWidth ? '100%' : '800px',
        mx: 'auto',
        ...sx,
      }}
    >
      {children}
    </PaperRoot>
  );
};

export default Paper;
