'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  CircularProgress,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import { 
  Upload as UploadIcon, 
  LinkOff as LinkOffIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  AutoAwesome as AutoAwesomeIcon,
  EditNote as EditNoteIcon,
  Launch as LaunchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { metadataApi, projectsApi } from '@/services/api';
import { UrlAnalysisResult, Category, CategoryWithSubcategories, Project } from '@/types';
import ErrorAlert from '@/components/UI/ErrorAlert';
import LoadingButton from '@/components/UI/LoadingButton';

interface BatchUrlProcessorProps {
  listId: number;
  categories: CategoryWithSubcategories[];
  onSuccess?: (addedProjects: Project[]) => void;
}

export default function BatchUrlProcessor({ 
  listId, 
  categories,
  onSuccess 
}: BatchUrlProcessorProps) {
  const [urls, setUrls] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<UrlAnalysisResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<UrlAnalysisResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [savingProjects, setSavingProjects] = useState(false);

  // Flatten categories for the dropdown
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

  // Handle URL textarea changes
  const handleUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUrls(e.target.value);
  };

  // Process the URLs
  const processUrls = async () => {
    if (!urls.trim()) {
      setError('Please enter at least one URL');
      return;
    }

    // Parse the URLs (one per line)
    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url); // Remove empty lines

    if (urlList.length === 0) {
      setError('Please enter at least one valid URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      setResults([]);
      setSelectedResults([]);

      // Process URLs in batches
      const results = await metadataApi.batchCharacterize(listId, urlList);
      
      // Set the results
      setResults(results);
      
      // Automatically select all valid results
      const validResults = results.filter(r => !r.error);
      setSelectedResults(validResults);
      
      setProgress(100);
    } catch (err: any) {
      console.error('Error processing URLs:', err);
      setError(`Failed to process URLs: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle selection of a result
  const toggleResultSelection = (result: UrlAnalysisResult) => {
    if (result.error) return; // Cannot select results with errors
    
    const isSelected = selectedResults.some(r => r.url === result.url);
    if (isSelected) {
      setSelectedResults(prevSelected => prevSelected.filter(r => r.url !== result.url));
    } else {
      setSelectedResults(prevSelected => [...prevSelected, result]);
    }
  };

  // Handle category change for a result
  const handleCategoryChange = (url: string, categoryId: number) => {
    setResults(prevResults => 
      prevResults.map(result => 
        result.url === url 
          ? { ...result, category_id: categoryId, confidence: null } // Reset confidence when manually changed
          : result
      )
    );
    
    // Update the selection as well if it exists
    setSelectedResults(prevSelected => 
      prevSelected.map(result => 
        result.url === url 
          ? { ...result, category_id: categoryId, confidence: null }
          : result
      )
    );
  };

  // Open confirmation dialog
  const openConfirmDialog = () => {
    if (selectedResults.length === 0) {
      setError('Please select at least one URL to add');
      return;
    }
    setShowConfirmDialog(true);
  };

  // Close confirmation dialog
  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
  };

  // Save selected projects to database
  const saveProjects = async () => {
    if (selectedResults.length === 0) {
      setError('Please select at least one URL to add');
      return;
    }

    try {
      setSavingProjects(true);
      setError(null);
      
      // Create projects one by one
      const addedProjects: Project[] = [];
      
      for (const result of selectedResults) {
        if (!result.category_id) {
          continue; // Skip results without a category
        }
        
        const projectData = {
          title: result.title || 'New Project',
          url: result.url,
          description: result.description || '',
          list_id: listId,
          category_id: result.category_id,
          metadata: {
            source: 'batch_processor',
            suggested_confidence: result.confidence || null
          }
        };
        
        const project = await projectsApi.create(projectData);
        addedProjects.push(project);
      }
      
      // Clear form and show success
      setUrls('');
      setResults([]);
      setSelectedResults([]);
      closeConfirmDialog();
      
      // Call the success callback if provided
      if (onSuccess && addedProjects.length > 0) {
        onSuccess(addedProjects);
      }
      
    } catch (err: any) {
      console.error('Error saving projects:', err);
      setError(`Failed to save projects: ${err.message || 'Unknown error'}`);
    } finally {
      setSavingProjects(false);
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId: number | null | undefined) => {
    if (!categoryId) return 'None';
    const category = flatCategories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  // Render confidence level
  const renderConfidence = (confidence: number | null | undefined) => {
    if (!confidence) return null;
    
    const percent = Math.round(confidence * 100);
    let color = 'default';
    
    if (percent >= 80) color = 'success';
    else if (percent >= 50) color = 'primary';
    else if (percent >= 30) color = 'warning';
    else color = 'error';
    
    return (
      <Tooltip title={`${percent}% confidence in this suggestion`}>
        <Chip 
          size="small" 
          color={color as any} 
          label={`${percent}%`}
          icon={<AutoAwesomeIcon />} 
        />
      </Tooltip>
    );
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Batch Process URLs
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Enter multiple URLs (one per line) to automatically fetch metadata and suggest categories.
        You can review and adjust the suggestions before adding them to your list.
      </Typography>

      <ErrorAlert message={error} />

      {/* URL Input */}
      <TextField
        fullWidth
        multiline
        rows={5}
        label="URLs (one per line)"
        placeholder="https://example.com/project1\nhttps://example.com/project2"
        value={urls}
        onChange={handleUrlsChange}
        disabled={loading}
        sx={{ mb: 2 }}
      />

      {/* Process Button */}
      <LoadingButton
        variant="contained"
        color="primary"
        onClick={processUrls}
        loading={loading}
        loadingText="Processing..."
        startIcon={<UploadIcon />}
        sx={{ mb: 3 }}
        disabled={!urls.trim()}
      >
        Process URLs
      </LoadingButton>

      {/* Progress Indicator */}
      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
            Processing URLs...
          </Typography>
        </Box>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            Results ({results.length} URLs processed, {selectedResults.length} selected)
          </Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" width={50}></TableCell>
                  <TableCell>URL / Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell width={90}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result, index) => {
                  const isSelected = selectedResults.some(r => r.url === result.url);
                  
                  return (
                    <TableRow 
                      key={index}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        backgroundColor: result.error ? '#fff8f8' : (isSelected ? '#f5f9ff' : 'inherit')
                      }}
                    >
                      {/* Selection Column */}
                      <TableCell padding="checkbox">
                        {result.error ? (
                          <Tooltip title="Error: Cannot select">
                            <span>
                              <IconButton size="small" disabled color="error">
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : (
                          <IconButton 
                            size="small" 
                            color={isSelected ? "primary" : "default"}
                            onClick={() => toggleResultSelection(result)}
                          >
                            {isSelected ? <CheckIcon fontSize="small" /> : null}
                          </IconButton>
                        )}
                      </TableCell>
                      
                      {/* URL/Title Column */}
                      <TableCell>
                        {result.error ? (
                          <Box>
                            <Typography variant="body2" color="error.main" fontWeight="medium">
                              Error: {result.error}
                            </Typography>
                            <Typography variant="caption" component="div" sx={{ wordBreak: 'break-all' }}>
                              {result.url}
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {result.title || 'Untitled'}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              component="div" 
                              sx={{ 
                                wordBreak: 'break-all',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              {result.url}
                              <Tooltip title="Open URL">
                                <IconButton 
                                  size="small" 
                                  href={result.url} 
                                  target="_blank" 
                                  rel="noopener"
                                  sx={{ ml: 0.5 }}
                                >
                                  <LaunchIcon fontSize="inherit" />
                                </IconButton>
                              </Tooltip>
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      
                      {/* Description Column */}
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxHeight: '60px', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {result.description || 'No description available'}
                        </Typography>
                      </TableCell>
                      
                      {/* Category Column */}
                      <TableCell>
                        {result.error ? (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <FormControl size="small" fullWidth>
                              <Select
                                value={result.category_id || ''}
                                onChange={(e) => handleCategoryChange(result.url, Number(e.target.value))}
                                displayEmpty
                                disabled={!isSelected}
                                size="small"
                              >
                                <MenuItem value="">
                                  <em>Select category</em>
                                </MenuItem>
                                {flatCategories.map((category) => (
                                  <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            {renderConfidence(result.confidence)}
                          </Box>
                        )}
                      </TableCell>
                      
                      {/* Actions Column */}
                      <TableCell>
                        {!result.error && (
                          <Tooltip title={isSelected ? "Deselect" : "Select"}>
                            <IconButton
                              color={isSelected ? "primary" : "default"}
                              size="small"
                              onClick={() => toggleResultSelection(result)}
                            >
                              {isSelected ? <CheckIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Add Selected Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={openConfirmDialog}
              disabled={selectedResults.length === 0}
              startIcon={<AddIcon />}
            >
              Add {selectedResults.length} Selected {selectedResults.length === 1 ? 'Project' : 'Projects'}
            </Button>
          </Box>
        </>
      )}
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onClose={closeConfirmDialog}>
        <DialogTitle>Confirm Adding Projects</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Are you sure you want to add {selectedResults.length} {selectedResults.length === 1 ? 'project' : 'projects'} to the list?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will create new projects for each selected URL with the specified categories.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} color="inherit">
            Cancel
          </Button>
          <LoadingButton 
            onClick={saveProjects} 
            color="primary" 
            loading={savingProjects}
            loadingText="Adding..."
            variant="contained"
          >
            Confirm
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
