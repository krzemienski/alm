import axios from 'axios';
import { 
  AwesomeList, 
  AwesomeListCreate, 
  AwesomeListImport, 
  Category, 
  CategoryCreate, 
  CategoryWithSubcategories, 
  Project, 
  ProjectCreate, 
  ValidationResult,
  ExportRequest,
  ExportResponse
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling middleware
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Awesome Lists API
export const awesomeListsApi = {
  // Get all awesome lists
  getAll: async (): Promise<AwesomeList[]> => {
    const response = await api.get('/awesome-lists');
    return response.data;
  },
  
  // Get a specific awesome list by ID
  getById: async (id: number): Promise<AwesomeList> => {
    const response = await api.get(`/awesome-lists/${id}`);
    return response.data;
  },
  
  // Create a new awesome list
  create: async (data: AwesomeListCreate): Promise<AwesomeList> => {
    const response = await api.post('/awesome-lists', data);
    return response.data;
  },
  
  // Update an existing awesome list
  update: async (id: number, data: Partial<AwesomeListCreate>): Promise<AwesomeList> => {
    const response = await api.put(`/awesome-lists/${id}`, data);
    return response.data;
  },
  
  // Delete an awesome list
  delete: async (id: number): Promise<void> => {
    await api.delete(`/awesome-lists/${id}`);
  },
  
  // Import an awesome list from GitHub
  import: async (data: AwesomeListImport): Promise<AwesomeList> => {
    const response = await api.post('/awesome-lists/import', data);
    return response.data;
  },
  
  // Export an awesome list to GitHub
  export: async (id: number): Promise<{ message: string; commit_url: string }> => {
    const response = await api.post(`/awesome-lists/${id}/export`, { id });
    return response.data;
  }
};

// Categories API
export const categoriesApi = {
  // Get all categories
  getAll: async (listId?: number, parentId?: number): Promise<Category[]> => {
    const params: Record<string, any> = {};
    if (listId !== undefined) params.list_id = listId;
    if (parentId !== undefined) params.parent_id = parentId;
    
    const response = await api.get('/categories', { params });
    return response.data;
  },
  
  // Get category tree structure
  getTree: async (listId: number): Promise<CategoryWithSubcategories[]> => {
    const response = await api.get(`/categories/tree?list_id=${listId}`);
    return response.data;
  },
  
  // Get a specific category by ID
  getById: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  
  // Create a new category
  create: async (data: CategoryCreate): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  
  // Update an existing category
  update: async (id: number, data: Partial<CategoryCreate>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
  
  // Delete a category
  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  }
};

// Projects API
export const projectsApi = {
  // Get all projects
  getAll: async (listId?: number, categoryId?: number): Promise<Project[]> => {
    const params: Record<string, any> = {};
    if (listId !== undefined) params.list_id = listId;
    if (categoryId !== undefined) params.category_id = categoryId;
    
    const response = await api.get('/projects', { params });
    return response.data;
  },
  
  // Get a specific project by ID
  getById: async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },
  
  // Create a new project
  create: async (data: ProjectCreate): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data;
  },
  
  // Update an existing project
  update: async (id: number, data: Partial<ProjectCreate>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },
  
  // Delete a project
  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  }
};

// GitHub API Services
export const githubApi = {
  // Repository validation
  validateRepository: async (owner: string, repo: string): Promise<any> => {
    const response = await api.get(`/github/validate/repository/${owner}/${repo}`);
    return response.data;
  },
  
  // Link checking
  checkLinks: async (owner: string, repo: string): Promise<ValidationResult> => {
    const response = await api.get(`/github/validate/links/${owner}/${repo}`);
    return response.data;
  },
  
  // README.md format linting
  lintReadme: async (owner: string, repo: string): Promise<ValidationResult> => {
    const response = await api.get(`/github/validate/readme/${owner}/${repo}`);
    return response.data;
  },
  
  // Import awesome list from GitHub
  importList: async (repositoryUrl: string): Promise<AwesomeList> => {
    const response = await api.post('/github/import', { repository_url: repositoryUrl });
    return response.data;
  },
  
  // Export awesome list to GitHub
  exportList: async (data: ExportRequest): Promise<ExportResponse> => {
    const response = await api.post('/github/export', data);
    return response.data;
  },
};
