// Basic types for the Awesome List Manager

// Awesome List type
export interface AwesomeList {
  id: number;
  title: string;
  description: string | null;
  repository_url: string;
  created_at: string;
  updated_at: string;
  categories_count?: number;
  projects_count?: number;
}

// Create types for API requests
export interface AwesomeListCreate {
  title: string;
  description?: string | null;
  repository_url: string;
}

export interface AwesomeListImport {
  repository_url: string;
  github_access_token?: string;
}

export interface ExportRequest {
  list_id: number;
  create_pull_request: boolean;
  branch_name: string;
  commit_message: string;
  format: string;
}

export interface ExportResponse {
  success: boolean;
  message?: string;
  pull_request_url?: string;
  file_content?: string;
  download_url: string;
}

// Category type
export interface Category {
  id: number;
  name: string;
  list_id: number;
  parent_category_id: number | null;
  order: number;
  created_at: string;
  updated_at: string;
}

// Category create type
export interface CategoryCreate {
  name: string;
  list_id: number;
  parent_category_id?: number | null;
  order?: number;
}

// Category with nested subcategories
export interface CategoryWithSubcategories extends Category {
  subcategories?: CategoryWithSubcategories[];
  projects?: Project[];
}

// Project type
export interface Project {
  id: number;
  title: string;
  url: string;
  description: string | null;
  list_id: number;
  category_id: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Project create type
export interface ProjectCreate {
  title: string;
  url: string;
  description?: string | null;
  list_id: number;
  category_id: number;
  metadata?: Record<string, any>;
}

// URL Analysis Result type for batch characterization
export interface UrlAnalysisResult {
  url: string;
  title?: string | null;
  description?: string | null;
  category_id?: number | null;
  confidence?: number | null;
  error?: string | null;
}

// GitHub validation types
export interface ValidationResult {
  success: boolean;
  issues: string[];
  message?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Form state types
export interface FormState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Import/Export types
export interface ImportRequest {
  repository_url: string;
}
