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
    categoryId: string;
  };
}

export default function EditCategory({ params }: PageProps) {
  const listId = parseInt(params.id);
  const categoryId = parseInt(params.categoryId);
  const [category, setCategory] = useState<Category | null>(null);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the category
        const categoryData = await categoriesApi.getById(categoryId);
        setCategory(categoryData);
        
        // Fetch potential parent categories
        const categoriesData = await categoriesApi.getAll(listId);
        
        // Filter out the current category and its subcategories to prevent circular references
        const filteredCategories = categoriesData.filter(c => c.id !== categoryId);
        setParentCategories(filteredCategories);
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load category data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (listId && categoryId) {
      fetchData();
    }
  }, [listId, categoryId]);

  const handleSubmit = async (formData: any) => {
    try {
      await categoriesApi.update(categoryId, formData);
      router.push(`/awesome-lists/${listId}`);
    } catch (err) {
      console.error('Failed to update category:', err);
      throw err;
    }
  };

  const handleBack = () => {
    router.push(`/awesome-lists/${listId}`);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Edit Category"
        subtitle={category ? category.name : `Category ID: ${categoryId}`}
        buttonText="Back to List"
        buttonIcon={<ArrowBackIcon />}
        onButtonClick={handleBack}
      />
      
      <ErrorAlert message={error} />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : category ? (
        <CategoryForm
          listId={listId}
          initialData={category}
          parentCategories={parentCategories}
          onSubmit={handleSubmit}
          isEdit={true}
        />
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          Category not found.
        </Paper>
      )}
    </AppLayout>
  );
}
