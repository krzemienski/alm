'use client';

import { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Container,
  Alert,
  AlertTitle
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import Link from 'next/link';

import AppLayout from '@/components/Layout/AppLayout';
import PageHeader from '@/components/UI/PageHeader';
import AwesomeListCard from './components/AwesomeListCard';
import { awesomeListsApi } from '@/services/api';
import { AwesomeList } from '@/types';

export default function Dashboard() {
  const [awesomeLists, setAwesomeLists] = useState<AwesomeList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetchAwesomeLists();
  }, []);

  const fetchAwesomeLists = async () => {
    try {
      setLoading(true);
      console.log('Fetching awesome lists...');
      const data = await awesomeListsApi.getAll();
      console.log('Awesome lists data:', data);

      // Use the data directly from the backend
      setAwesomeLists(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch awesome lists:', err);
      setError('Failed to load awesome lists. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await awesomeListsApi.delete(id);
      // Remove the deleted list from the state
      setAwesomeLists(prevLists => prevLists.filter(list => list.id !== id));
      setDeleteSuccess(true);
      // Hide the success message after 3 seconds
      setTimeout(() => setDeleteSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to delete awesome list:', err);
      throw err;
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="xl">
        <PageHeader
          title="Awesome Lists Dashboard"
          subtitle="Manage your curated awesome lists"
          buttonText="Create New List"
          buttonIcon={<AddIcon />}
          buttonHref="/awesome-lists/new"
        />

        {deleteSuccess && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            onClose={() => setDeleteSuccess(false)}
          >
            <AlertTitle>Success</AlertTitle>
            Awesome list deleted successfully.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : awesomeLists.length > 0 ? (
          <Grid container spacing={3}>
            {awesomeLists.map((list) => (
              <Grid item xs={12} sm={6} md={4} key={list.id}>
                <AwesomeListCard
                  awesomeList={list}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" paragraph>
              No awesome lists found
            </Typography>
            <Typography variant="body1" paragraph color="text.secondary">
              Get started by creating your first awesome list or importing an existing one from GitHub.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                component={Link}
                href="/awesome-lists/new"
                startIcon={<AddIcon />}
              >
                Create New List
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/import-export"
              >
                Import from GitHub
              </Button>
            </Box>
          </Paper>
        )}
      </Container>
    </AppLayout>
  );
}
