'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  LinkOff as LinkOffIcon
} from '@mui/icons-material';
import AppLayout from '@/components/Layout/AppLayout';
import PageHeader from '@/components/UI/PageHeader';
import BatchUrlProcessor from '@/components/Projects/BatchUrlProcessor';
import { awesomeListsApi, categoriesApi } from '@/services/api';
import { AwesomeList, CategoryWithSubcategories, Project } from '@/types';

interface PageProps {
  params: {
    id: string;
  };
}

export default function BatchUrlsPage({ params }: PageProps) {
  const listId = parseInt(params.id);
  const [awesomeList, setAwesomeList] = useState<AwesomeList | null>(null);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [addedProjects, setAddedProjects] = useState<Project[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch awesome list
        const listData = await awesomeListsApi.getById(listId);
        setAwesomeList(listData);
        
        // Fetch categories tree
        const categoriesData = await categoriesApi.getTree(listId);
        setCategories(categoriesData);
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load awesome list data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (listId) {
      fetchData();
    }
  }, [listId]);

  const handleSuccess = (projects: Project[]) => {
    setSuccess(true);
    setAddedProjects(projects);
    
    // Scroll to the top to show the success message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (error || !awesomeList) {
    return (
      <AppLayout>
        <Paper sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
          <Typography variant="h6" gutterBottom>
            Error
          </Typography>
          <Typography paragraph>
            {error || 'Awesome list not found.'}
          </Typography>
          <Button variant="contained" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </Paper>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title="Batch Process URLs"
        subtitle={`Add multiple projects to ${awesomeList.title} at once`}
        action={
          <Button 
            variant="outlined" 
            onClick={() => router.push(`/awesome-lists/${listId}`)}
            startIcon={<ArrowBackIcon />}
          >
            Back to List
          </Button>
        }
      />

      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 4 }}
          onClose={() => setSuccess(false)}
        >
          <Typography variant="body1" fontWeight="medium">
            Success! {addedProjects.length} projects added to your list.
          </Typography>
          <Typography variant="body2">
            You can view and edit them in their respective categories.
          </Typography>
        </Alert>
      )}

      <BatchUrlProcessor 
        listId={listId}
        categories={categories}
        onSuccess={handleSuccess}
      />

      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Instructions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" paragraph>
          The batch URL processor allows you to add multiple projects to your awesome list at once. Here's how to use it:
        </Typography>
        <Box component="ol" sx={{ pl: 3 }}>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body1">
              Enter one URL per line in the text box.
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body1">
              Click "Process URLs" to fetch metadata and suggested categories for each URL.
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body1">
              Review the results and make any necessary adjustments.
            </Typography>
          </Box>
          <Box component="li" sx={{ mb: 1 }}>
            <Typography variant="body1">
              Select the URLs you want to add (automatically selected by default).
            </Typography>
          </Box>
          <Box component="li">
            <Typography variant="body1">
              Click "Add Selected Projects" to add them to your list.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </AppLayout>
  );
}
