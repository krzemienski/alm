'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import AppLayout from '@/components/Layout/AppLayout';
import PageHeader from '@/components/UI/PageHeader';
import ErrorAlert from '@/components/UI/ErrorAlert';
import AwesomeListForm from '@/components/Forms/AwesomeListForm';
import { awesomeListsApi } from '@/services/api';
import { AwesomeList } from '@/types';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditAwesomeList({ params }: PageProps) {
  const listId = parseInt(params.id);
  const [awesomeList, setAwesomeList] = useState<AwesomeList | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const data = await awesomeListsApi.getById(listId);
        setAwesomeList(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch awesome list:', err);
        setError('Failed to load awesome list. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (listId) {
      fetchList();
    }
  }, [listId]);

  const handleSubmit = async (formData: any) => {
    try {
      await awesomeListsApi.update(listId, formData);
      router.push(`/awesome-lists/${listId}`);
    } catch (err) {
      console.error('Failed to update awesome list:', err);
      throw err;
    }
  };

  const handleBack = () => {
    router.push(`/awesome-lists/${listId}`);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Edit Awesome List"
        buttonText="Back to List"
        buttonIcon={<ArrowBackIcon />}
        onButtonClick={handleBack}
      />
      
      <ErrorAlert message={error} />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : awesomeList ? (
        <AwesomeListForm
          initialData={awesomeList}
          onSubmit={handleSubmit}
          isEdit={true}
        />
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          Awesome list not found.
        </Paper>
      )}
    </AppLayout>
  );
}
