'use client';

import { Box, Typography, Button, ButtonProps, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonIcon?: ReactNode;
  onButtonClick?: () => void;
  buttonHref?: string;
  buttonProps?: ButtonProps;
  action?: ReactNode;
  sx?: SxProps<Theme>;
}

export default function PageHeader({
  title,
  subtitle,
  buttonText,
  buttonIcon,
  onButtonClick,
  buttonHref,
  buttonProps,
  action,
  sx
}: PageHeaderProps) {
  return (
    <Box sx={{ 
      mb: 4, 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      ...sx
    }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      
      {action ? (
        action
      ) : buttonText && (buttonHref || onButtonClick) && (
        buttonHref ? (
          <Link href={buttonHref} passHref style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              startIcon={buttonIcon}
              {...buttonProps}
            >
              {buttonText}
            </Button>
          </Link>
        ) : (
          <Button
            variant="contained"
            onClick={onButtonClick}
            startIcon={buttonIcon}
            {...buttonProps}
          >
            {buttonText}
          </Button>
        )
      )}
    </Box>
  );
}
