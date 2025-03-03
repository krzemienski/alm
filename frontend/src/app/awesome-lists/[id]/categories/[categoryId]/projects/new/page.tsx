'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import AppLayout from '@/components/Layout/AppLayout';
import PageHeader from '@/components/UI/PageHeader';
import ErrorAlert from '@/components/UI/ErrorAlert';
import ProjectForm from '@/components/Forms/ProjectForm';
import { categoriesApi, projectsApi } from '@/services/api';
import { Category, CategoryWithSubcategories } from '@/types';

interface PageProps {
  params: {
    id: string;
    categoryId: string;
  };
}

export default function NewProject({ params }: PageProps) {
  const listId = parseInt(params.id);
  const categoryId = parseInt(params.categoryId);
  const [category, setCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
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
        
        // Fetch all categories for the dropdown
        const categoriesData = await categoriesApi.getTree(listId);
        setCategories(categoriesData);
        
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
      // Ensure the project is created with the correct category ID
      const projectData = {
        ...formData,
        category_id: categoryId
      };
      
      await projectsApi.create(projectData);
      router.push(`/awesome-lists/${listId}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      throw err;
    }
  };

  const handleBack = () => {
    router.push(`/awesome-lists/${listId}`);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Add New Project"
        subtitle={category ? `To Category: ${category.name}` : `To Category ID: ${categoryId}`}
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
        <ProjectForm
          listId={listId}
          initialData={{ category_id: categoryId }}
          categories={categories}
          onSubmit={handleSubmit}
        />
      )}
    </AppLayout>
  );
}
