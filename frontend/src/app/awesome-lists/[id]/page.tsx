'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  IconButton,
  Snackbar,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GitHub as GitHubIcon,
  ImportExport as ImportExportIcon,
  Link as LinkIcon,
  Search as SearchIcon,
  PostAdd as PostAddIcon
} from '@mui/icons-material';
import AppLayout from '@/components/Layout/AppLayout';
import PageHeader from '@/components/UI/PageHeader';
import ConfirmationDialog from '@/components/UI/ConfirmationDialog';
import { awesomeListsApi, categoriesApi, projectsApi } from '@/services/api';
import { AwesomeList, CategoryWithSubcategories, Project } from '@/types';

interface PageProps {
  params: {
    id: string;
  };
}

export default function AwesomeListDetail({ params }: PageProps) {
  const listId = parseInt(params.id);
  const [awesomeList, setAwesomeList] = useState<AwesomeList | null>(null);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [projects, setProjects] = useState<Record<number, Project[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteItemType, setDeleteItemType] = useState<'category' | 'project'>('category');
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [deleteItemName, setDeleteItemName] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch awesome list
        const listData = await awesomeListsApi.getById(listId);
        setAwesomeList(listData);
        
        // Fetch categories tree
        const categoriesData = await categoriesApi.getTree(listId);
        setCategories(categoriesData);
        
        // Initialize expanded state for categories
        const initialExpandedCategories: Record<number, boolean> = {};
        const initialExpandedSubcategories: Record<number, boolean> = {};
        
        categoriesData.forEach(category => {
          initialExpandedCategories[category.id] = false;
          if (category.subcategories && Array.isArray(category.subcategories)) {
            category.subcategories.forEach(subcategory => {
              initialExpandedSubcategories[subcategory.id] = false;
            });
          }
        });
        
        setExpandedCategories(initialExpandedCategories);
        setExpandedSubcategories(initialExpandedSubcategories);
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load awesome list data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (listId) {
      fetchData();
    }
  }, [listId]);

  const handleToggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
    
    // If expanding, fetch projects for this category
    if (!expandedCategories[categoryId]) {
      fetchProjectsByCategory(categoryId);
    }
  };

  const handleToggleSubcategory = (subcategoryId: number) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
    
    // If expanding, fetch projects for this subcategory
    if (!expandedSubcategories[subcategoryId]) {
      fetchProjectsByCategory(subcategoryId);
    }
  };

  const fetchProjectsByCategory = async (categoryId: number) => {
    try {
      // Check if we already have these projects
      if (projects[categoryId]) return;
      
      const projectsData = await projectsApi.getAll(listId, categoryId);
      setProjects(prev => ({
        ...prev,
        [categoryId]: projectsData
      }));
    } catch (err) {
      console.error(`Failed to fetch projects for category ${categoryId}:`, err);
      // Show notification
      setNotificationMessage(`Failed to load projects for this category.`);
      setNotificationOpen(true);
    }
  };

  const fetchCategories = async () => {
    try {
      // Fetch categories tree
      const categoriesData = await categoriesApi.getTree(listId);
      setCategories(categoriesData);
      
      // Initialize expanded state for categories
      const initialExpandedCategories: Record<number, boolean> = {};
      const initialExpandedSubcategories: Record<number, boolean> = {};
      
      categoriesData.forEach(category => {
        initialExpandedCategories[category.id] = false;
        if (category.subcategories && Array.isArray(category.subcategories)) {
          category.subcategories.forEach(subcategory => {
            initialExpandedSubcategories[subcategory.id] = false;
          });
        }
      });
      
      setExpandedCategories(initialExpandedCategories);
      setExpandedSubcategories(initialExpandedSubcategories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load category data. Please try again later.');
    }
  };

  const handleExport = async () => {
    router.push(`/export/${listId}`);
  };

  const handleCloseNotification = () => {
    setNotificationOpen(false);
  };

  const openDeleteDialog = (type: 'category' | 'project', id: number, name: string) => {
    setDeleteItemType(type);
    setDeleteItemId(id);
    setDeleteItemName(name);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setDeleteItemId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItemId) return;
    
    try {
      if (deleteItemType === 'category') {
        await categoriesApi.delete(deleteItemId);
        await fetchCategories(); // Refresh categories after delete
        
        setNotificationMessage(`Category "${deleteItemName}" deleted successfully.`);
      } else {
        await projectsApi.delete(deleteItemId);
        // Refresh all projects for all expanded categories
        Object.keys(expandedCategories).forEach(categoryId => {
          if (expandedCategories[Number(categoryId)]) {
            fetchProjectsByCategory(Number(categoryId));
          }
        });
        
        setNotificationMessage(`Project "${deleteItemName}" deleted successfully.`);
      }
      
      setNotificationOpen(true);
    } catch (error) {
      console.error(`Error deleting ${deleteItemType}:`, error);
      setNotificationMessage(`Failed to delete ${deleteItemType}. Please try again.`);
      setNotificationOpen(true);
    } finally {
      closeDeleteDialog();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filterBySearch = (items: any[], key: string) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item[key].toLowerCase().includes(searchQuery) || 
      (item.description && item.description.toLowerCase().includes(searchQuery))
    );
  };

  const filteredCategories = searchQuery 
    ? categories.filter(category => 
        category.name.toLowerCase().includes(searchQuery) ||
        (category.subcategories && category.subcategories.some(sub => 
          sub.name.toLowerCase().includes(searchQuery)
        )) ||
        Object.keys(projects).some(catId => 
          projects[Number(catId)] && 
          projects[Number(catId)].some(project => 
            project.title.toLowerCase().includes(searchQuery) || 
            (project.description && project.description.toLowerCase().includes(searchQuery))
          )
        )
      )
    : categories;

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (error || !awesomeList) {
    return (
      <AppLayout>
        <Paper sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
          <Typography variant="h6" gutterBottom>
            Error
          </Typography>
          <Typography paragraph>
            {error || 'Awesome list not found.'}
          </Typography>
          <Button variant="contained" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </Paper>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader 
        title={awesomeList.title}
        subtitle="Manage categories and projects"
        action={
          <Box display="flex" gap={2}>
            <Button 
              variant="contained" 
              startIcon={<ImportExportIcon />}
              onClick={handleExport}
              disabled={exportStatus === 'loading'}
            >
              {exportStatus === 'loading' ? 'Exporting...' : 'Export README'}
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => router.push(`/awesome-lists/${listId}/edit`)}
              startIcon={<EditIcon />}
            >
              Edit List
            </Button>
          </Box>
        }
      />

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="body1" paragraph>
          {awesomeList.description || 'No description provided.'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <GitHubIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            Repository: <a href={awesomeList.repository_url} target="_blank" rel="noopener noreferrer">
              {awesomeList.repository_url}
            </a>
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Categories
        </Typography>
        <Box display="flex" gap={2}>
          <TextField
            placeholder="Search categories and projects..."
            size="small"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => router.push(`/awesome-lists/${listId}/batch-urls`)}
            startIcon={<PostAddIcon />}
            color="secondary"
          >
            Batch Add URLs
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => router.push(`/awesome-lists/${listId}/categories/new`)}
            startIcon={<AddIcon />}
          >
            Add Category
          </Button>
        </Box>
      </Box>

      {filteredCategories.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {searchQuery ? 'No matching categories or projects found.' : 'No categories found. Add a category to get started.'}
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <List component="div" disablePadding>
            {filteredCategories.map((category) => (
              <Box key={category.id}>
                <ListItem
                  sx={{ 
                    backgroundColor: 'background.paper', 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <ListItemIcon onClick={() => handleToggleCategory(category.id)} sx={{ cursor: 'pointer' }}>
                    {expandedCategories[category.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </ListItemIcon>
                  <ListItemText primary={category.name} />
                  <IconButton size="small" onClick={() => router.push(`/awesome-lists/${listId}/categories/${category.id}/edit`)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => openDeleteDialog('category', category.id, category.name)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <Button 
                    size="small" 
                    startIcon={<AddIcon />}
                    onClick={() => router.push(`/awesome-lists/${listId}/categories/${category.id}/projects/new`)}
                    sx={{ ml: 2 }}
                  >
                    Add Project
                  </Button>
                </ListItem>

                {/* Category Projects */}
                <Collapse in={expandedCategories[category.id]} timeout="auto" unmountOnExit>
                  {projects[category.id] && projects[category.id].length > 0 ? (
                    <List component="div" disablePadding>
                      {filterBySearch(projects[category.id], 'title').map((project) => (
                        <ListItem key={project.id} sx={{ pl: 4, backgroundColor: 'action.hover' }}>
                          <ListItemIcon>
                            <LinkIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={project.title}
                            secondary={project.description}
                          />
                          <IconButton size="small" onClick={() => router.push(`/awesome-lists/${listId}/projects/${project.id}/edit`)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => openDeleteDialog('project', project.id, project.title)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ pl: 9, py: 2 }}>
                      No projects in this category.
                    </Typography>
                  )}
                </Collapse>

                {/* Subcategories */}
                {category.subcategories && category.subcategories.length > 0 && (
                  <Collapse in={expandedCategories[category.id]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {filterBySearch(category.subcategories, 'name').map((subcategory) => (
                        <Box key={subcategory.id}>
                          <ListItem sx={{ pl: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <ListItemIcon onClick={() => handleToggleSubcategory(subcategory.id)} sx={{ cursor: 'pointer' }}>
                              {expandedSubcategories[subcategory.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </ListItemIcon>
                            <ListItemText primary={subcategory.name} />
                            <IconButton size="small" onClick={() => router.push(`/awesome-lists/${listId}/categories/${subcategory.id}/edit`)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => openDeleteDialog('category', subcategory.id, subcategory.name)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                            <Button 
                              size="small" 
                              startIcon={<AddIcon />}
                              onClick={() => router.push(`/awesome-lists/${listId}/categories/${subcategory.id}/projects/new`)}
                              sx={{ ml: 2 }}
                            >
                              Add Project
                            </Button>
                          </ListItem>

                          {/* Subcategory Projects */}
                          <Collapse in={expandedSubcategories[subcategory.id]} timeout="auto" unmountOnExit>
                            {projects[subcategory.id] && projects[subcategory.id].length > 0 ? (
                              <List component="div" disablePadding>
                                {filterBySearch(projects[subcategory.id], 'title').map((project) => (
                                  <ListItem key={project.id} sx={{ pl: 8, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                                    <ListItemIcon>
                                      <LinkIcon />
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={project.title}
                                      secondary={project.description}
                                    />
                                    <IconButton size="small" onClick={() => router.push(`/awesome-lists/${listId}/projects/${project.id}/edit`)}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      color="error"
                                      onClick={() => openDeleteDialog('project', project.id, project.title)}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ pl: 13, py: 2 }}>
                                No projects in this subcategory.
                              </Typography>
                            )}
                          </Collapse>
                        </Box>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Box>
            ))}
          </List>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        title={`Delete ${deleteItemType === 'category' ? 'Category' : 'Project'}`}
        message={`Are you sure you want to delete "${deleteItemName}"? This action cannot be undone.${
          deleteItemType === 'category' ? ' All projects in this category will also be deleted.' : ''
        }`}
        confirmLabel="Delete"
        severity="error"
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteDialog}
      />

      <Snackbar 
        open={notificationOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={exportStatus === 'error' ? 'error' : 'success'} 
          sx={{ width: '100%' }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}
