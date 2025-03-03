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
import { Project, CategoryWithSubcategories } from '@/types';

interface PageProps {
  params: {
    id: string;
    projectId: string;
  };
}

export default function EditProject({ params }: PageProps) {
  const listId = parseInt(params.id);
  const projectId = parseInt(params.projectId);
  const [project, setProject] = useState<Project | null>(null);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch the project
        const projectData = await projectsApi.getById(projectId);
        setProject(projectData);
        
        // Fetch all categories for the dropdown
        const categoriesData = await categoriesApi.getTree(listId);
        setCategories(categoriesData);
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load project data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (listId && projectId) {
      fetchData();
    }
  }, [listId, projectId]);

  const handleSubmit = async (formData: any) => {
    try {
      await projectsApi.update(projectId, formData);
      router.push(`/awesome-lists/${listId}`);
    } catch (err) {
      console.error('Failed to update project:', err);
      throw err;
    }
  };

  const handleBack = () => {
    router.push(`/awesome-lists/${listId}`);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Edit Project"
        subtitle={project ? project.title : `Project ID: ${projectId}`}
        buttonText="Back to List"
        buttonIcon={<ArrowBackIcon />}
        onButtonClick={handleBack}
      />
      
      <ErrorAlert message={error} />
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : project ? (
        <ProjectForm
          listId={listId}
          initialData={project}
          categories={categories}
          onSubmit={handleSubmit}
          isEdit={true}
        />
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          Project not found.
        </Paper>
      )}
    </AppLayout>
  );
}
