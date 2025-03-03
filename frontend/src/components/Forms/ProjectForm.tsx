'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { Save as SaveIcon, Link as LinkIcon } from '@mui/icons-material';
import { Category, CategoryWithSubcategories, Project } from '@/types';
import ErrorAlert from '@/components/UI/ErrorAlert';
import LoadingButton from '@/components/UI/LoadingButton';

interface ProjectFormProps {
  listId: number;
  initialData?: Partial<Project>;
  categories?: CategoryWithSubcategories[];
  onSubmit: (data: any) => Promise<void>;
  isEdit?: boolean;
}

export default function ProjectForm({ 
  listId,
  initialData = {}, 
  categories = [],
  onSubmit,
  isEdit = false
}: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    url: initialData.url || '',
    list_id: listId,
    category_id: initialData.category_id || (categories.length > 0 ? categories[0].id : 0),
    metadata: initialData.metadata || {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flatten categories for the dropdown
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);

  useEffect(() => {
    const flatten = (categories: CategoryWithSubcategories[], result: Category[] = []) => {
      categories.forEach(category => {
        result.push(category);
        if (category.subcategories && category.subcategories.length > 0) {
          flatten(category.subcategories, result);
        }
      });
      return result;
    };

    setFlatCategories(flatten(categories));
  }, [categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Project title is required');
      return false;
    }
    
    if (!formData.url.trim()) {
      setError('Project URL is required');
      return false;
    }
    
    // Basic URL validation
    try {
      new URL(formData.url);
    } catch (_) {
      setError('Please enter a valid URL (e.g., https://github.com/username/repo)');
      return false;
    }
    
    if (!formData.category_id) {
      setError('Please select a category');
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
      setError('Failed to save project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? 'Edit Project' : 'Add Project'}
      </Typography>
      
      <ErrorAlert message={error} />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Project Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Project Title"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Project URL"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://github.com/username/repository"
            InputProps={{
              startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="A short description of this project"
            multiline
            rows={3}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              name="category_id"
              value={formData.category_id.toString()}
              label="Category"
              onChange={handleSelectChange}
            >
              {flatCategories.map((category) => (
                <MenuItem 
                  key={category.id} 
                  value={category.id.toString()}
                >
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          {isEdit ? 'Update' : 'Add Project'}
        </LoadingButton>
      </Box>
    </Paper>
  );
}
