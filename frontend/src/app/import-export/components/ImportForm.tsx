'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  TextField, 
  Typography, 
  Paper,
  Divider
} from '@mui/material';
import { GitHub as GitHubIcon } from '@mui/icons-material';

import LoadingButton from '@/components/UI/LoadingButton';
import ErrorAlert from '@/components/UI/ErrorAlert';
import { awesomeListsApi } from '@/services/api';

export default function ImportForm() {
  const router = useRouter();
  const [repositoryUrl, setRepositoryUrl] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleRepositoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepositoryUrl(e.target.value);
  };

  const handleImport = async () => {
    if (!repositoryUrl) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    try {
      setIsImporting(true);
      setError(null);
      
      // Directly use the awesomeListsApi.import method without validation
      const response = await awesomeListsApi.import({ repository_url: repositoryUrl });
      
      if (response && response.id) {
        // Navigate to the new awesome list page
        router.push(`/awesome-lists/${response.id}`);
      } else {
        setError('Failed to import awesome list. Please try again.');
      }
    } catch (err: any) {
      console.error('Import failed:', err);
      setError(err.response?.data?.detail || 'Failed to import awesome list. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Import Awesome List from GitHub
        </Typography>
        
        <ErrorAlert message={error} />
        
        <TextField
          fullWidth
          label="GitHub Repository URL"
          placeholder="https://github.com/username/repo"
          value={repositoryUrl}
          onChange={handleRepositoryChange}
          margin="normal"
          InputProps={{
            startAdornment: <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          helperText="Enter the full URL to a GitHub repository containing an awesome list"
        />
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <LoadingButton
          variant="contained"
          onClick={handleImport}
          loading={isImporting}
          loadingText="Importing..."
        >
          Import Awesome List
        </LoadingButton>
      </Box>
    </Box>
  );
}
