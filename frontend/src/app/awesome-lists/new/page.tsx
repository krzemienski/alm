'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import AppLayout from '@/components/Layout/AppLayout';
import PageHeader from '@/components/UI/PageHeader';
import AwesomeListForm from '@/components/Forms/AwesomeListForm';
import { awesomeListsApi } from '@/services/api';
import ErrorAlert from '@/components/UI/ErrorAlert';

export default function NewAwesomeList() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: any) => {
    try {
      const newList = await awesomeListsApi.create(formData);
      router.push(`/awesome-lists/${newList.id}`);
    } catch (err) {
      console.error('Failed to create awesome list:', err);
      setError('Failed to create awesome list. Please try again later.');
      throw err;
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <AppLayout>
      <PageHeader
        title="Create New Awesome List"
        subtitle="Add a curated collection of awesome resources"
        buttonText="Back to Dashboard"
        buttonIcon={<ArrowBackIcon />}
        onButtonClick={handleBack}
      />
      
      <ErrorAlert message={error} />
      
      <AwesomeListForm onSubmit={handleSubmit} />
    </AppLayout>
  );
}
