'use client';

import { useState, useEffect, useRef } from 'react';
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
  SelectChangeEvent,
  Chip,
  Tooltip,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Link as LinkIcon,
  Refresh as RefreshIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { Category, CategoryWithSubcategories, Project } from '@/types';
import ErrorAlert from '@/components/UI/ErrorAlert';
import LoadingButton from '@/components/UI/LoadingButton';
import { metadataApi } from '@/services/api';

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
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [categoryConfidence, setCategoryConfidence] = useState<number | null>(null);

  // Use ref to track if URL has already been processed
  const urlProcessedRef = useRef<string | null>(null);

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

    // Auto-fetch metadata when URL is entered and has a valid format
    if (name === 'url' && value && value !== urlProcessedRef.current) {
      // Basic validation before trying to fetch
      try {
        new URL(value);
        fetchSiteMetadata(value);
      } catch (_) {
        // Not a valid URL yet, do nothing
      }
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const fetchSiteMetadata = async (url: string) => {
    try {
      setFetchingMetadata(true);
      setCategoryConfidence(null);
      
      // Remember this URL so we don't process it again
      urlProcessedRef.current = url;
      
      // Get site metadata
      const metadata = await metadataApi.getSiteMetadata(url);
      
      // Auto-fill description if it's empty
      if (!formData.description && metadata.description) {
        setFormData(prev => ({
          ...prev,
          description: metadata.description
        }));
      }
      
      // Auto-fill title if it's empty or generic
      if ((!formData.title || formData.title === 'New Project') && metadata.title) {
        setFormData(prev => ({
          ...prev,
          title: metadata.title
        }));
      }
      
      // Get category suggestion if not in edit mode
      if (!isEdit) {
        const suggestion = await metadataApi.getCategorySuggestion(
          listId, 
          url,
          formData.description
        );
        
        if (suggestion.category_id && suggestion.confidence > 0.3) {
          setFormData(prev => ({
            ...prev,
            category_id: suggestion.category_id
          }));
          setCategoryConfidence(suggestion.confidence);
        }
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setFetchingMetadata(false);
    }
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

  // Function to manually refresh metadata
  const refreshMetadata = () => {
    if (formData.url) {
      try {
        new URL(formData.url);
        fetchSiteMetadata(formData.url);
      } catch (_) {
        setError('Please enter a valid URL before refreshing metadata');
      }
    } else {
      setError('Please enter a URL to fetch metadata');
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
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Refresh metadata from URL">
                    <IconButton 
                      onClick={refreshMetadata}
                      disabled={fetchingMetadata}
                      edge="end"
                    >
                      {fetchingMetadata ? <CircularProgress size={20} /> : <RefreshIcon />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
          {fetchingMetadata && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Fetching website information...
            </Typography>
          )}
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
              value={formData.category_id ? formData.category_id.toString() : ''}
              label="Category"
              onChange={handleSelectChange}
              startAdornment={
                categoryConfidence !== null ? (
                  <Tooltip title={`Auto-suggested with ${Math.round(categoryConfidence * 100)}% confidence`}>
                    <AutoAwesomeIcon 
                      color="primary" 
                      fontSize="small" 
                      sx={{ ml: 1, mr: 1 }} 
                    />
                  </Tooltip>
                ) : null
              }
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
            {categoryConfidence !== null && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Category was auto-suggested based on URL content
              </Typography>
            )}
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
