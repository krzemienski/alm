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
  Alert,
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  LinkOff as LinkOffIcon,
  AutoAwesome as AutoAwesomeIcon,
  FormatListBulleted as FormatListBulletedIcon
} from '@mui/icons-material';
import AppLayout from '@/components/Layout/AppLayout';
import PageHeader from '@/components/UI/PageHeader';
import BatchUrlProcessor from '@/components/Projects/BatchUrlProcessor';
import AiBatchProcessor from '@/components/Projects/AiBatchProcessor';
import { awesomeListsApi, categoriesApi, projectsApi } from '@/services/api';
import { AwesomeList, CategoryWithSubcategories, Project } from '@/types';

interface PageProps {
  params: {
    id: string;
  };
}

export default function BatchUrlsPage({ params }: PageProps) {
  const listId = parseInt(params.id);
  const [awesomeList, setAwesomeList] = useState<AwesomeList | null>(null);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [addedProjects, setAddedProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch awesome list
        const listData = await awesomeListsApi.getById(listId);
        setAwesomeList(listData);
        
        // Fetch categories tree
        const categoriesData = await categoriesApi.getTree(listId);
        setCategories(categoriesData);
      } catch (err: any) {
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

  const handleSuccess = (projects: Project[]) => {
    setSuccess(true);
    setAddedProjects(projects);
    
    // Scroll to the top to show the success message
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddProjects = async (projectsToAdd: any[]) => {
    try {
      setLoading(true);
      
      // Create an array to store created projects
      const createdProjects: Project[] = [];
      
      // Add each project sequentially
      for (const projectData of projectsToAdd) {
        const newProject = await projectsApi.create({
          list_id: listId,
          title: projectData.title,
          url: projectData.url,
          description: projectData.description,
          category_id: await getCategoryId(projectData.category, projectData.subcategory)
        });
        
        createdProjects.push(newProject);
      }
      
      handleSuccess(createdProjects);
    } catch (err: any) {
      console.error('Failed to add projects:', err);
      setError('Failed to add projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get category ID from name
  const getCategoryId = async (categoryName: string, subcategoryName?: string | null): Promise<number> => {
    // If there's a subcategory, find its ID
    if (subcategoryName) {
      const mainCategory = categories.find(c => c.name === categoryName);
      if (mainCategory && mainCategory.subcategories) {
        const subcategory = mainCategory.subcategories.find(s => s.name === subcategoryName);
        if (subcategory) {
          return subcategory.id;
        }
        
        // Create subcategory if it doesn't exist
        try {
          const newSubcategory = await categoriesApi.create({
            list_id: listId,
            name: subcategoryName,
            parent_category_id: mainCategory.id
          });
          return newSubcategory.id;
        } catch (err) {
          console.error('Failed to create subcategory:', err);
          return mainCategory.id; // Fall back to main category
        }
      }
    }
    
    // Otherwise, find the main category ID
    const category = categories.find(c => c.name === categoryName);
    if (category) {
      return category.id;
    }
    
    // If category doesn't exist, create it
    try {
      const newCategory = await categoriesApi.create({
        list_id: listId,
        name: categoryName,
        parent_category_id: null
      });
      return newCategory.id;
    } catch (err) {
      console.error('Failed to create category:', err);
      
      // If we can't create a category, return the first category as fallback
      if (categories.length > 0) {
        return categories[0].id;
      }
      
      throw new Error('No categories available and failed to create new category');
    }
  };

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
        title="Batch Process URLs"
        subtitle={`Add multiple projects to ${awesomeList.title} at once`}
        action={
          <Button 
            variant="outlined" 
            onClick={() => router.push(`/awesome-lists/${listId}`)}
            startIcon={<ArrowBackIcon />}
          >
            Back to List
          </Button>
        }
      />

      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 4 }}
          onClose={() => setSuccess(false)}
        >
          <Typography variant="body1" fontWeight="medium">
            Success! {addedProjects.length} projects added to your list.
          </Typography>
          <Typography variant="body2">
            You can view and edit them in their respective categories.
          </Typography>
        </Alert>
      )}

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            icon={<FormatListBulletedIcon />} 
            label="Standard Batch Processing" 
            iconPosition="start"
          />
          <Tab 
            icon={<AutoAwesomeIcon />} 
            label="AI-Powered Batch Processing" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {activeTab === 0 ? (
        <BatchUrlProcessor 
          listId={listId}
          categories={categories}
          onSuccess={handleSuccess}
        />
      ) : (
        <AiBatchProcessor 
          listId={listId}
          categories={categories}
          onAddProjects={handleAddProjects}
        />
      )}

      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Instructions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {activeTab === 0 ? (
          <>
            <Typography variant="body1" paragraph>
              The standard batch URL processor allows you to add multiple projects to your awesome list at once. Here's how to use it:
            </Typography>
            <Box component="ol" sx={{ pl: 3 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Enter one URL per line in the text box.
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Click "Process URLs" to fetch metadata and suggested categories for each URL.
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Review the results and make any necessary adjustments.
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Select the URLs you want to add (automatically selected by default).
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body1">
                  Click "Add Selected Projects" to add them to your list.
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="body1" paragraph>
              The AI-powered batch processor uses artificial intelligence to analyze GitHub repositories, extract metadata, suggest categories, and generate descriptions. Here's how to use it:
            </Typography>
            <Box component="ol" sx={{ pl: 3 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Choose between OpenAI (default) or Ollama (local AI) for processing.
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Enter GitHub URLs (one per line or comma-separated) and click "Add URLs".
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Click "Process with AI" to analyze the repositories and suggest categories.
                </Typography>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Typography variant="body1">
                  Review the AI suggestions and adjust categories if needed.
                </Typography>
              </Box>
              <Box component="li">
                <Typography variant="body1">
                  Click "Add Selected to List" to add the repositories to your awesome list.
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </AppLayout>
  );
}
