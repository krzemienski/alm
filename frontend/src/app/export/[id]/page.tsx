'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Paper, 
  TextField, 
  Typography, 
  Button, 
  CircularProgress, 
  Alert, 
  AlertTitle,
  FormControlLabel,
  Checkbox,
  Divider,
  Card,
  CardContent,
  Container
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  GitHub as GitHubIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

import AppLayout from '@/components/Layout/AppLayout';
import PageHeader from '@/components/UI/PageHeader';
import LoadingButton from '@/components/UI/LoadingButton';
import ErrorAlert from '@/components/UI/ErrorAlert';
import { awesomeListsApi, githubApi } from '@/services/api';
import { AwesomeList, ExportRequest } from '@/types';

interface PageProps {
  params: {
    id: string;
  };
}

export default function ExportAwesomeList({ params }: PageProps) {
  const listId = parseInt(params.id);
  const router = useRouter();
  
  const [awesomeList, setAwesomeList] = useState<AwesomeList | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pullRequestUrl, setPullRequestUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ExportRequest>({
    list_id: listId,
    create_pull_request: true,
    branch_name: '',
    commit_message: '',
    format: 'markdown' // Default format
  });

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const data = await awesomeListsApi.getById(listId);
        setAwesomeList(data);
        
        // Set default values for branch and commit message
        setFormData(prev => ({
          ...prev,
          branch_name: `update-${data.title.toLowerCase().replace(/\s+/g, '-')}`,
          commit_message: `Update ${data.title} awesome list`
        }));
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch awesome list:', err);
        setError('Failed to load awesome list data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (listId) {
      fetchList();
    }
  }, [listId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);
      setSuccessMessage(null);
      setPullRequestUrl(null);
      
      const response = await githubApi.exportList(formData);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Export completed successfully!');
        if (response.pull_request_url) {
          setPullRequestUrl(response.pull_request_url);
        }
      } else {
        setError(response.message || 'Export failed. Please try again.');
      }
    } catch (err) {
      console.error('Export failed:', err);
      setError('Failed to export awesome list. Please try again later.');
    } finally {
      setExporting(false);
    }
  };

  const handleBack = () => {
    router.push(`/awesome-lists/${listId}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <PageHeader
          title="Export Awesome List"
          buttonText="Back to List"
          buttonIcon={<ArrowBackIcon />}
          onButtonClick={handleBack}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (!awesomeList) {
    return (
      <AppLayout>
        <PageHeader
          title="Export Awesome List"
          buttonText="Back to Dashboard"
          buttonIcon={<ArrowBackIcon />}
          onButtonClick={() => router.push('/dashboard')}
        />
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          Awesome list not found.
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container maxWidth="md">
        <PageHeader
          title="Export Awesome List"
          subtitle={awesomeList.title}
          buttonText="Back to List"
          buttonIcon={<ArrowBackIcon />}
          onButtonClick={handleBack}
        />
        
        <ErrorAlert message={error} />
        
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => setSuccessMessage(null)}
          >
            <AlertTitle>Success</AlertTitle>
            {successMessage}
            {pullRequestUrl && (
              <Box sx={{ mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  href={pullRequestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<GitHubIcon />}
                >
                  View Pull Request
                </Button>
              </Box>
            )}
          </Alert>
        )}
        
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Repository Information
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body1">
                {awesomeList.repository_url}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              This list will be exported as a formatted README.md file according to awesome list standards.
            </Typography>
          </CardContent>
        </Card>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Export Options
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox 
                checked={formData.create_pull_request}
                onChange={handleChange}
                name="create_pull_request"
              />
            }
            label="Create a pull request"
          />
          
          {formData.create_pull_request && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Branch Name"
                name="branch_name"
                value={formData.branch_name}
                onChange={handleChange}
                placeholder="update-awesome-list"
                margin="normal"
                helperText="The name of the branch to create for this update"
              />
              
              <TextField
                fullWidth
                label="Commit Message"
                name="commit_message"
                value={formData.commit_message}
                onChange={handleChange}
                placeholder="Update awesome list"
                margin="normal"
                helperText="A descriptive message for the commit"
              />
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <LoadingButton
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              loading={exporting}
              loadingText="Exporting..."
            >
              Export List
            </LoadingButton>
          </Box>
        </Paper>
      </Container>
    </AppLayout>
  );
}
