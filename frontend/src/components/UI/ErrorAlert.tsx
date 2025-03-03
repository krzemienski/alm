'use client';

import { Alert, AlertProps, Box } from '@mui/material';

interface ErrorAlertProps extends AlertProps {
  message: string | null;
}

export default function ErrorAlert({ message, ...props }: ErrorAlertProps) {
  if (!message) return null;
  
  return (
    <Box sx={{ mb: 3 }}>
      <Alert severity="error" {...props}>
        {message}
      </Alert>
    </Box>
  );
}
