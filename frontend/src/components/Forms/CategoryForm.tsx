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
import { Save as SaveIcon } from '@mui/icons-material';
import { Category } from '@/types';
import ErrorAlert from '@/components/UI/ErrorAlert';
import LoadingButton from '@/components/UI/LoadingButton';

interface CategoryFormProps {
  listId: number;
  initialData?: Partial<Category>;
  parentCategories?: Category[];
  onSubmit: (data: any) => Promise<void>;
  isEdit?: boolean;
}

export default function CategoryForm({ 
  listId,
  initialData = {}, 
  parentCategories = [],
  onSubmit,
  isEdit = false
}: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    list_id: listId,
    parent_category_id: initialData.parent_category_id || null,
    order: initialData.order || 0
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

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === 'null' ? null : Number(value)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Category name is required');
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
      setError('Failed to save category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? 'Edit Category' : 'Create Category'}
      </Typography>
      
      <ErrorAlert message={error} />
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Category Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Category Name"
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="parent-category-label">Parent Category</InputLabel>
            <Select
              labelId="parent-category-label"
              id="parent-category"
              name="parent_category_id"
              value={formData.parent_category_id === null ? 'null' : formData.parent_category_id.toString()}
              label="Parent Category"
              onChange={handleSelectChange}
            >
              <MenuItem value="null">None (Root Category)</MenuItem>
              {parentCategories.map((category) => (
                <MenuItem 
                  key={category.id} 
                  value={category.id.toString()}
                  disabled={category.id === initialData.id} // Prevent selecting self as parent
                >
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="number"
            label="Display Order"
            name="order"
            value={formData.order}
            onChange={handleChange}
            helperText="Lower numbers appear first"
            InputProps={{ inputProps: { min: 0 } }}
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
