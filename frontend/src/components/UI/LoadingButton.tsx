'use client';

import { useState } from 'react';
import { 
  Button, 
  ButtonProps, 
  CircularProgress 
} from '@mui/material';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

export default function LoadingButton({ 
  children, 
  loading = false, 
  loadingText = 'Loading...', 
  disabled,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : props.startIcon}
    >
      {loading ? loadingText : children}
    </Button>
  );
}
