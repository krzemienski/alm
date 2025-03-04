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
  ExportResponse,
  UrlAnalysisResult
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

// Helper to ensure trailing slashes on all URLs
const ensureTrailingSlash = (url: string): string => {
  return url.endsWith('/') ? url : `${url}/`;
};

// Awesome Lists API
export const awesomeListsApi = {
  // Get all awesome lists
  getAll: async (): Promise<AwesomeList[]> => {
    const response = await api.get(ensureTrailingSlash('/awesome-lists'));
    return response.data;
  },
  
  // Get a specific awesome list by ID
  getById: async (id: number): Promise<AwesomeList> => {
    const response = await api.get(ensureTrailingSlash(`/awesome-lists/${id}`));
    return response.data;
  },
  
  // Create a new awesome list
  create: async (data: AwesomeListCreate): Promise<AwesomeList> => {
    const response = await api.post(ensureTrailingSlash('/awesome-lists'), data);
    return response.data;
  },
  
  // Update an existing awesome list
  update: async (id: number, data: Partial<AwesomeListCreate>): Promise<AwesomeList> => {
    const response = await api.put(ensureTrailingSlash(`/awesome-lists/${id}`), data);
    return response.data;
  },
  
  // Delete an awesome list
  delete: async (id: number): Promise<void> => {
    await api.delete(ensureTrailingSlash(`/awesome-lists/${id}`));
  },
  
  // Import an awesome list from GitHub
  import: async (data: AwesomeListImport): Promise<AwesomeList> => {
    const response = await api.post(ensureTrailingSlash('/awesome-lists/import'), data);
    return response.data;
  },
  
  // Export an awesome list to GitHub
  export: async (id: number): Promise<{ message: string; commit_url: string }> => {
    const response = await api.post(ensureTrailingSlash(`/awesome-lists/${id}/export`), { id });
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
    
    const response = await api.get(ensureTrailingSlash('/categories'), { params });
    return response.data;
  },
  
  // Get category tree structure
  getTree: async (listId: number): Promise<CategoryWithSubcategories[]> => {
    const response = await api.get(ensureTrailingSlash(`/categories/tree?list_id=${listId}`));
    return response.data;
  },
  
  // Get a specific category by ID
  getById: async (id: number): Promise<Category> => {
    const response = await api.get(ensureTrailingSlash(`/categories/${id}`));
    return response.data;
  },
  
  // Create a new category
  create: async (data: CategoryCreate): Promise<Category> => {
    const response = await api.post(ensureTrailingSlash('/categories'), data);
    return response.data;
  },
  
  // Update an existing category
  update: async (id: number, data: Partial<CategoryCreate>): Promise<Category> => {
    const response = await api.put(ensureTrailingSlash(`/categories/${id}`), data);
    return response.data;
  },
  
  // Delete a category
  delete: async (id: number): Promise<void> => {
    await api.delete(ensureTrailingSlash(`/categories/${id}`));
  }
};

// Projects API
export const projectsApi = {
  // Get all projects
  getAll: async (listId?: number, categoryId?: number): Promise<Project[]> => {
    const params: Record<string, any> = {};
    if (listId !== undefined) params.list_id = listId;
    if (categoryId !== undefined) params.category_id = categoryId;
    
    const response = await api.get(ensureTrailingSlash('/projects'), { params });
    return response.data;
  },
  
  // Get a specific project by ID
  getById: async (id: number): Promise<Project> => {
    const response = await api.get(ensureTrailingSlash(`/projects/${id}`));
    return response.data;
  },
  
  // Create a new project
  create: async (data: ProjectCreate): Promise<Project> => {
    const response = await api.post(ensureTrailingSlash('/projects'), data);
    return response.data;
  },
  
  // Update an existing project
  update: async (id: number, data: Partial<ProjectCreate>): Promise<Project> => {
    const response = await api.put(ensureTrailingSlash(`/projects/${id}`), data);
    return response.data;
  },
  
  // Delete a project
  delete: async (id: number): Promise<void> => {
    await api.delete(ensureTrailingSlash(`/projects/${id}`));
  }
};

// Metadata API Services
export const metadataApi = {
  // Get site metadata
  getSiteMetadata: async (url: string): Promise<any> => {
    const response = await api.get(
      ensureTrailingSlash('/metadata/site'),
      { params: { url } }
    );
    return response.data;
  },
  
  // Get category suggestion for a URL
  getCategorySuggestion: async (listId: number, url: string, description?: string): Promise<any> => {
    const params: Record<string, any> = { list_id: listId, url };
    if (description) params.description = description;
    
    const response = await api.get(
      ensureTrailingSlash('/metadata/category-suggestion'),
      { params }
    );
    return response.data;
  },
  
  // Batch characterize multiple URLs
  batchCharacterize: async (listId: number, urls: string[]): Promise<UrlAnalysisResult[]> => {
    const response = await api.post(
      ensureTrailingSlash('/metadata/batch-characterize'),
      { list_id: listId, urls }
    );
    return response.data;
  },
  
  // AI-powered categorization for a single URL
  aiCategorize: async (listId: number, url: string, useOllama: boolean = false): Promise<any> => {
    const response = await api.post(
      ensureTrailingSlash('/metadata/ai-categorize'),
      { url, use_ollama: useOllama },
      { params: { list_id: listId } }
    );
    return response.data;
  },
  
  // AI-powered batch categorization for multiple URLs
  aiBatchCategorize: async (listId: number, urls: string[], useOllama: boolean = false): Promise<any[]> => {
    const response = await api.post(
      ensureTrailingSlash('/metadata/ai-batch-categorize'),
      { urls, use_ollama: useOllama },
      { params: { list_id: listId } }
    );
    return response.data;
  }
};

// GitHub API Services
export const githubApi = {
  // Repository validation
  validateRepository: async (owner: string, repo: string): Promise<any> => {
    const response = await api.get(ensureTrailingSlash(`/github/validate/repository/${owner}/${repo}`));
    return response.data;
  },
  
  // Link checking
  checkLinks: async (owner: string, repo: string): Promise<ValidationResult> => {
    const response = await api.get(ensureTrailingSlash(`/github/validate/links/${owner}/${repo}`));
    return response.data;
  },
  
  // README.md format linting
  lintReadme: async (owner: string, repo: string): Promise<ValidationResult> => {
    const response = await api.get(ensureTrailingSlash(`/github/validate/readme/${owner}/${repo}`));
    return response.data;
  },
  
  // Import awesome list from GitHub
  importList: async (repositoryUrl: string): Promise<AwesomeList> => {
    const response = await api.post(ensureTrailingSlash('/github/import'), { repository_url: repositoryUrl });
    return response.data;
  },
  
  // Export awesome list to GitHub
  exportList: async (data: ExportRequest): Promise<ExportResponse> => {
    const response = await api.post(ensureTrailingSlash('/github/export'), data);
    return response.data;
  },
};
