import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Paper,
  Chip,
  FormControlLabel,
  Switch,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import { metadataApi } from '@/services/api';

interface AiBatchProcessorProps {
  listId: number;
  onAddProjects: (selectedProjects: any[]) => void;
  categories: any[];
}

interface ProcessedUrl {
  url: string;
  metadata: {
    title: string;
    description: string;
  };
  category: string | null;
  subcategory: string | null;
  summary: string | null;
  selected: boolean;
  error?: string;
}

const AiBatchProcessor: React.FC<AiBatchProcessorProps> = ({
  listId,
  onAddProjects,
  categories,
}) => {
  const [urlText, setUrlText] = useState('');
  const [useOllama, setUseOllama] = useState(false);
  const [urlsToProcess, setUrlsToProcess] = useState<string[]>([]);
  const [processedUrls, setProcessedUrls] = useState<ProcessedUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUrlTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrlText(e.target.value);
  };

  const addUrl = () => {
    const urls = urlText
      .split(/[\n,]/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0 && url.startsWith('http'));

    if (urls.length === 0) {
      setError('Please enter valid URLs starting with http:// or https://');
      return;
    }

    setUrlsToProcess([...urlsToProcess, ...urls]);
    setUrlText('');
  };

  const removeUrl = (indexToRemove: number) => {
    setUrlsToProcess(urlsToProcess.filter((_, index) => index !== indexToRemove));
  };

  const processUrls = async () => {
    if (urlsToProcess.length === 0) {
      setError('Please add URLs to process');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await metadataApi.aiBatchCategorize(listId, urlsToProcess, useOllama);
      
      const processed = results.map((result: any) => ({
        ...result,
        selected: true,
      }));
      
      setProcessedUrls(processed);
      setUrlsToProcess([]);
      setSuccess(true);
    } catch (err) {
      console.error('Error processing URLs:', err);
      setError('Failed to process URLs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUrlSelection = (index: number) => {
    const updatedUrls = [...processedUrls];
    updatedUrls[index].selected = !updatedUrls[index].selected;
    setProcessedUrls(updatedUrls);
  };

  const updateCategory = (index: number, category: string) => {
    const updatedUrls = [...processedUrls];
    updatedUrls[index].category = category;
    setProcessedUrls(updatedUrls);
  };

  const updateSubcategory = (index: number, subcategory: string) => {
    const updatedUrls = [...processedUrls];
    updatedUrls[index].subcategory = subcategory;
    setProcessedUrls(updatedUrls);
  };

  const handleAddSelected = () => {
    const selectedProjects = processedUrls
      .filter((url) => url.selected)
      .map((url) => ({
        url: url.url,
        title: url.metadata.title,
        description: url.summary || url.metadata.description,
        category: url.category,
        subcategory: url.subcategory,
      }));

    if (selectedProjects.length === 0) {
      setError('Please select at least one URL to add');
      return;
    }

    onAddProjects(selectedProjects);
    setProcessedUrls([]);
  };

  const renderCategoryOptions = (mainCategory?: string) => {
    if (!mainCategory) {
      return categories.map((cat) => (
        <option key={cat.id} value={cat.name}>
          {cat.name}
        </option>
      ));
    } else {
      const category = categories.find((cat) => cat.name === mainCategory);
      if (!category || !category.subcategories || category.subcategories.length === 0) {
        return <option value="">No subcategories available</option>;
      }
      
      return category.subcategories.map((subcat: any) => (
        <option key={subcat.id} value={subcat.name}>
          {subcat.name}
        </option>
      ));
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(false);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        AI-Powered Batch URL Processor
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        This tool uses AI to analyze GitHub repositories, extract metadata, suggest categories, and generate
        descriptions. Enter URLs below (one per line or comma-separated), then click "Process with AI".
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={useOllama}
              onChange={() => setUseOllama(!useOllama)}
              name="useOllama"
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              Use Ollama (local AI) instead of OpenAI
              <Tooltip title="Ollama must be running locally on your machine. This option uses less computational resources and doesn't require an API key, but may provide less accurate results.">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
          }
        />
      </Box>

      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Enter URLs (one per line or comma-separated)"
          value={urlText}
          onChange={handleUrlTextChange}
          placeholder="https://github.com/username/repo"
          variant="outlined"
          disabled={loading}
        />
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={addUrl}
            disabled={loading || !urlText}
            startIcon={<AddIcon />}
          >
            Add URLs
          </Button>
        </Box>
      </Paper>

      {urlsToProcess.length > 0 && (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            URLs to Process ({urlsToProcess.length})
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            {urlsToProcess.map((url, index) => (
              <Chip
                key={index}
                label={url}
                onDelete={() => removeUrl(index)}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={processUrls}
              disabled={loading || urlsToProcess.length === 0}
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <CategoryIcon />}
            >
              {loading ? 'Processing...' : 'Process with AI'}
            </Button>
          </Box>
        </Paper>
      )}

      {processedUrls.length > 0 && (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            AI Analysis Results ({processedUrls.length})
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            Review the AI suggestions below. You can modify categories or deselect items before adding them to your list.
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">Select</TableCell>
                  <TableCell>Repository</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Subcategory</TableCell>
                  <TableCell>AI Summary</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processedUrls.map((url, index) => (
                  <TableRow key={index} selected={url.selected}>
                    <TableCell padding="checkbox">
                      <Tooltip title={url.selected ? "Deselect" : "Select"}>
                        <Chip 
                          icon={url.selected ? <CheckCircleIcon /> : undefined}
                          label={url.selected ? "Selected" : "Select"}
                          color={url.selected ? "primary" : "default"}
                          variant={url.selected ? "filled" : "outlined"}
                          onClick={() => toggleUrlSelection(index)}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {url.metadata.title}
                      </Typography>
                      <Typography variant="caption" component="div">
                        <a href={url.url} target="_blank" rel="noopener noreferrer">
                          {url.url}
                        </a>
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <select
                        value={url.category || ''}
                        onChange={(e) => updateCategory(index, e.target.value)}
                        style={{
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          background: 'transparent',
                          color: 'inherit',
                          width: '100%',
                        }}
                      >
                        <option value="">Select category</option>
                        {renderCategoryOptions()}
                      </select>
                    </TableCell>
                    <TableCell>
                      <select
                        value={url.subcategory || ''}
                        onChange={(e) => updateSubcategory(index, e.target.value)}
                        disabled={!url.category}
                        style={{
                          padding: '8px',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          background: 'transparent',
                          color: 'inherit',
                          width: '100%',
                          opacity: url.category ? 1 : 0.5,
                        }}
                      >
                        <option value="">Select subcategory</option>
                        {url.category ? renderCategoryOptions(url.category) : null}
                      </select>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {url.summary || url.metadata.description || 'No summary available'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddSelected}
              disabled={processedUrls.filter(url => url.selected).length === 0}
              startIcon={<AddIcon />}
            >
              Add Selected to List
            </Button>
          </Box>
        </Paper>
      )}

      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          URLs processed successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AiBatchProcessor;
