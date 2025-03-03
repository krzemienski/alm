'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import AppLayout from '@/components/Layout/AppLayout';
import PageHeader from '@/components/UI/PageHeader';
import ErrorAlert from '@/components/UI/ErrorAlert';
import CategoryForm from '@/components/Forms/CategoryForm';
import { categoriesApi } from '@/services/api';
import { Category } from '@/types';

interface PageProps {
  params: {
    id: string;
  };
}

export default function NewCategory({ params }: PageProps) {
  const listId = parseInt(params.id);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Get only root categories
        const data = await categoriesApi.getAll(listId);
        setParentCategories(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (listId) {
      fetchCategories();
    }
  }, [listId]);

  const handleSubmit = async (formData: any) => {
    try {
      await categoriesApi.create(formData);
      router.push(`/awesome-lists/${listId}`);
    } catch (err) {
      console.error('Failed to create category:', err);
      throw err;
    }
  };

  const handleBack = () => {
    router.push(`/awesome-lists/${listId}`);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Create New Category"
        subtitle={`For Awesome List ID: ${listId}`}
        buttonText="Back to List"
        buttonIcon={<ArrowBackIcon />}
        onButtonClick={handleBack}
      />
      
      <ErrorAlert message={error} />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <CategoryForm
          listId={listId}
          parentCategories={parentCategories}
          onSubmit={handleSubmit}
        />
      )}
    </AppLayout>
  );
}
