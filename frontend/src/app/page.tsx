'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  useScrollTrigger
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  ImportExport as ImportExportIcon,
  Category as CategoryIcon,
  List as ListIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Code as CodeIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function ElevationScroll(props: { children: React.ReactElement }) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0
  });

  return React.cloneElement(children, {
    elevation: trigger ? 4 : 0,
    sx: {
      backgroundColor: trigger ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
      transition: '0.3s',
      color: trigger ? 'text.primary' : 'white',
      boxShadow: trigger ? 1 : 0
    }
  });
}

export default function Home() {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <ElevationScroll>
        <AppBar position="fixed" color="transparent">
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              ALM
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                color="inherit"
                component={Link}
                href="/about"
              >
                About
              </Button>
              <Button
                color="inherit"
                component={Link}
                href="https://github.com/sindresorhus/awesome"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<GitHubIcon />}
              >
                Awesome Lists
              </Button>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                href="/dashboard"
              >
                Dashboard
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
      </ElevationScroll>

      <Box
        sx={{
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          pt: { xs: 12, md: 20 },
          pb: { xs: 12, md: 15 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography variant="h2" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                Awesome List Manager
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, fontWeight: 400 }}>
                Create, manage, and maintain curated collections of awesome resources with ease
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  component={Link}
                  href="/dashboard"
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    backgroundColor: 'white',
                    color: '#764ba2',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component={Link}
                  href="/about"
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                component="img"
                src="/hero-image.svg"
                alt="Awesome List Manager"
                sx={{
                  width: '100%',
                  display: { xs: 'none', md: 'block' },
                  filter: 'drop-shadow(0px 5px 10px rgba(0, 0, 0, 0.2))'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 700 }}>
          Features
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 8, maxWidth: '800px', mx: 'auto' }}>
          Everything you need to manage awesome lists efficiently
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', boxShadow: 3, transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 5 } }}>
              <CardContent>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <ImportExportIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                  <Typography variant="h5">
                    Import & Export
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  Import existing awesome lists from GitHub repositories and export them back with proper formatting.
                </Typography>
                <List>
                  <ListItem sx={{ p: 0, mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="GitHub integration" />
                  </ListItem>
                  <ListItem sx={{ p: 0, mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Automatic parsing" />
                  </ListItem>
                  <ListItem sx={{ p: 0 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Pull request creation" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', boxShadow: 3, transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 5 } }}>
              <CardContent>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <CategoryIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                  <Typography variant="h5">
                    Organize
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  Easily organize projects into categories and subcategories with a clean, intuitive interface.
                </Typography>
                <List>
                  <ListItem sx={{ p: 0, mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Nested categories" />
                  </ListItem>
                  <ListItem sx={{ p: 0, mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Drag and drop" />
                  </ListItem>
                  <ListItem sx={{ p: 0 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Bulk operations" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', boxShadow: 3, transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: 5 } }}>
              <CardContent>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <ListIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                  <Typography variant="h5">
                    Validate
                  </Typography>
                </Box>
                <Typography variant="body1" paragraph>
                  Validate links, check formatting, and ensure your awesome list follows community guidelines.
                </Typography>
                <List>
                  <ListItem sx={{ p: 0, mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Link checking" />
                  </ListItem>
                  <ListItem sx={{ p: 0, mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Format validation" />
                  </ListItem>
                  <ListItem sx={{ p: 0 }}>
                    <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                      <CheckCircleIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Awesome list compliance" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ bgcolor: 'background.default', py: 10 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                Open Source
              </Typography>
              <Typography variant="body1" paragraph>
                Awesome List Manager is open source software built with modern technologies. Contributions and feedback are welcome!
              </Typography>
              <List>
                <ListItem sx={{ p: 0, mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Frontend: Next.js, TypeScript, Material UI"
                    secondary="Modern React framework with type safety and beautiful components"
                  />
                </ListItem>
                <ListItem sx={{ p: 0, mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Backend: FastAPI, SQLAlchemy, Pydantic"
                    secondary="High-performance API with robust data validation"
                  />
                </ListItem>
                <ListItem sx={{ p: 0 }}>
                  <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                    <CodeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Deployment: Docker, PostgreSQL"
                    secondary="Containerized for consistent environments"
                  />
                </ListItem>
              </List>
              <Button
                variant="outlined"
                size="large"
                startIcon={<GitHubIcon />}
                component="a"
                href="https://github.com/username/alm"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 2 }}
              >
                View on GitHub
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/open-source.svg"
                alt="Open Source"
                sx={{
                  width: '100%',
                  filter: 'drop-shadow(0px 5px 10px rgba(0, 0, 0, 0.1))'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
            Ready to get started?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: '700px', mx: 'auto' }}>
            Create, manage, and maintain your awesome lists with a modern, intuitive interface
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            href="/dashboard"
            sx={{
              py: 1.5,
              px: 5,
              borderRadius: 2,
              backgroundColor: 'white',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              }
            }}
            endIcon={<ArrowForwardIcon />}
          >
            Go to Dashboard
          </Button>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#1e1e1e', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
                {new Date().getFullYear()} Awesome List Manager
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  color="inherit"
                  size="small"
                  component={Link}
                  href="/about"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  About
                </Button>
                <Button
                  color="inherit"
                  size="small"
                  component={Link}
                  href="https://github.com/username/alm"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  GitHub
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
