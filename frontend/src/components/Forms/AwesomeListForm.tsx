'use client';

import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Grid,
  Typography
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { AwesomeList } from '@/types';
import ErrorAlert from '@/components/UI/ErrorAlert';
import LoadingButton from '@/components/UI/LoadingButton';

interface AwesomeListFormProps {
  initialData?: Partial<AwesomeList>;
  onSubmit: (data: any) => Promise<void>;
  isEdit?: boolean;
}

export default function AwesomeListForm({ 
  initialData = {}, 
  onSubmit,
  isEdit = false
}: AwesomeListFormProps) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    repository_url: initialData.repository_url || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    
    if (!formData.repository_url.trim()) {
      setError('Repository URL is required');
      return false;
    }
    
    // Basic GitHub URL validation
    const githubUrlRegex = /^https?:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/i;
    if (!githubUrlRegex.test(formData.repository_url)) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/username/repo)');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await onSubmit(formData);
    } catch (err) {
      console.error('Form submission error:', err);
      setError('Failed to save awesome list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? 'Edit Awesome List' : 'Create Awesome List'}
      </Typography>
      
      <ErrorAlert message={error} />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Awesome List Title"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="A short description of this awesome list"
            multiline
            rows={3}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="GitHub Repository URL"
            name="repository_url"
            value={formData.repository_url}
            onChange={handleChange}
            placeholder="https://github.com/username/repository"
            helperText="Enter the full URL to the GitHub repository"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={loading}
          loadingText="Saving..."
          startIcon={<SaveIcon />}
        >
          {isEdit ? 'Update' : 'Create'}
        </LoadingButton>
      </Box>
    </Paper>
  );
}
