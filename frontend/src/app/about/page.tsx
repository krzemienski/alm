'use client';

import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Link as MuiLink,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { 
  GitHub as GitHubIcon,
  CheckCircle as CheckCircleIcon,
  Code as CodeIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

import AppLayout from '@/components/Layout/AppLayout';
import PageHeader from '@/components/UI/PageHeader';

export default function AboutPage() {
  return (
    <AppLayout>
      <Container maxWidth="md">
        <PageHeader
          title="About"
          subtitle="Learn about the Awesome List Manager"
        />
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Awesome List Manager (ALM)
          </Typography>
          
          <Typography paragraph>
            Awesome List Manager is a web application designed to help maintain and manage curated lists of awesome resources following the 
            <MuiLink 
              href="https://github.com/sindresorhus/awesome" 
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ mx: 1 }}
            >
              awesome list
            </MuiLink>
            format popularized on GitHub.
          </Typography>
          
          <Typography paragraph>
            This tool helps maintainers of awesome lists to:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Organize categories and projects in a structured way" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Validate links to ensure all resources are accessible" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Import existing awesome lists from GitHub repositories" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Export structured content back to GitHub with proper formatting" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary="Create pull requests to update awesome list repositories" />
            </ListItem>
          </List>
        </Paper>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <CodeIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Frontend
                  </Typography>
                </Box>
                <Typography paragraph variant="body2" color="text.secondary">
                  Built with modern web technologies for a responsive and intuitive user experience.
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip size="small" label="Next.js" />
                  <Chip size="small" label="TypeScript" />
                  <Chip size="small" label="Material UI" />
                  <Chip size="small" label="React" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <StorageIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Backend
                  </Typography>
                </Box>
                <Typography paragraph variant="body2" color="text.secondary">
                  Powered by a robust API server with database integration and GitHub connectivity.
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip size="small" label="Python" />
                  <Chip size="small" label="FastAPI" />
                  <Chip size="small" label="SQLAlchemy" />
                  <Chip size="small" label="Pydantic" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <CloudIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Deployment
                  </Typography>
                </Box>
                <Typography paragraph variant="body2" color="text.secondary">
                  Containerized for easy deployment and consistent environments across platforms.
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip size="small" label="Docker" />
                  <Chip size="small" label="Docker Compose" />
                  <Chip size="small" label="PostgreSQL" />
                  <Chip size="small" label="SQLite (Dev)" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <GitHubIcon sx={{ mr: 1 }} />
            <Typography variant="h6">
              Open Source
            </Typography>
          </Box>
          
          <Typography paragraph>
            Awesome List Manager is open source software. Contributions and feedback are welcome!
          </Typography>
          
          <MuiLink 
            href="https://github.com/username/alm" 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              textDecoration: 'none'
            }}
          >
            <GitHubIcon fontSize="small" sx={{ mr: 0.5 }} />
            View on GitHub
          </MuiLink>
        </Paper>
      </Container>
    </AppLayout>
  );
}
