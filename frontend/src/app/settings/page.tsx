'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Divider,
  FormControlLabel,
  Switch,
  InputAdornment,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import { 
  GitHub as GitHubIcon, 
  Key as KeyIcon, 
  Save as SaveIcon,
  Public as PublicIcon
} from '@mui/icons-material';

import AppLayout from '@/components/Layout/AppLayout';
import PageHeader from '@/components/UI/PageHeader';
import LoadingButton from '@/components/UI/LoadingButton';
import ErrorAlert from '@/components/UI/ErrorAlert';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    githubToken: '',
    apiBaseUrl: 'http://localhost:8000/api/v1',
    autoValidateLinks: true,
    showGitHubStats: true,
  });
  const [originalSettings, setOriginalSettings] = useState({...settings});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, we would fetch these from an API or local storage
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('alm-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setOriginalSettings(parsed);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // In a real app, this would be an API call
      localStorage.setItem('alm-settings', JSON.stringify(settings));
      setOriginalSettings({...settings});
      
      setSuccessMessage('Settings saved successfully!');
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  };

  return (
    <AppLayout>
      <Container maxWidth="md">
        <PageHeader
          title="Settings"
          subtitle="Configure your Awesome List Manager"
        />
        
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Alert>
        )}
        
        <ErrorAlert message={error} />
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            GitHub Integration
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="githubToken"
                label="GitHub Personal Access Token"
                value={settings.githubToken}
                onChange={handleChange}
                placeholder="Enter your GitHub token"
                type="password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="Required for GitHub operations like importing and exporting awesome lists"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <GitHubIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Create a token with 'repo' scope at{' '}
                  <a 
                    href="https://github.com/settings/tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: 'inherit' }}
                  >
                    github.com/settings/tokens
                  </a>
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="showGitHubStats"
                    checked={settings.showGitHubStats}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Show GitHub stats (stars, forks) for repositories"
              />
            </Grid>
          </Grid>
        </Paper>
        
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Application Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="apiBaseUrl"
                label="API Base URL"
                value={settings.apiBaseUrl}
                onChange={handleChange}
                placeholder="http://localhost:8000/api/v1"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PublicIcon />
                    </InputAdornment>
                  ),
                }}
                helperText="The base URL for API requests"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="autoValidateLinks"
                    checked={settings.autoValidateLinks}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Automatically validate links when importing or exporting"
              />
            </Grid>
          </Grid>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <LoadingButton
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            loading={saving}
            loadingText="Saving..."
            disabled={!hasChanges()}
          >
            Save Settings
          </LoadingButton>
        </Box>
      </Container>
    </AppLayout>
  );
}
