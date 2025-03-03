'use client';

import { useState } from 'react';
import { 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Collapse,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { CategoryWithSubcategories } from '@/types';

interface CategoryTreeProps {
  categories: CategoryWithSubcategories[];
  onAddProject?: (categoryId: number) => void;
  onEditCategory?: (categoryId: number) => void;
  onDeleteCategory?: (categoryId: number) => void;
  onAddSubcategory?: (parentId: number) => void;
}

export default function CategoryTree({ 
  categories, 
  onAddProject,
  onEditCategory,
  onDeleteCategory,
  onAddSubcategory
}: CategoryTreeProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const handleToggle = (categoryId: number) => {
    setExpanded(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const renderCategories = (categories: CategoryWithSubcategories[], level = 0) => {
    return (
      <List component="div" disablePadding>
        {categories.map((category) => (
          <Box key={category.id}>
            <ListItem 
              sx={{ 
                pl: level * 2,
                backgroundColor: level === 0 ? 'background.paper' : 'rgba(255, 255, 255, 0.05)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              <ListItemIcon 
                onClick={() => handleToggle(category.id)} 
                sx={{ cursor: 'pointer' }}
              >
                {(category.subcategories && category.subcategories.length > 0) ? 
                  (expanded[category.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />) : 
                  <div style={{ width: 24 }} />
                }
              </ListItemIcon>
              <ListItemText primary={category.name} />
              <Box>
                {onAddSubcategory && (
                  <IconButton 
                    size="small" 
                    onClick={() => onAddSubcategory(category.id)}
                    title="Add subcategory"
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                )}
                {onEditCategory && (
                  <IconButton 
                    size="small" 
                    onClick={() => onEditCategory(category.id)}
                    title="Edit category"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                {onDeleteCategory && (
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => onDeleteCategory(category.id)}
                    title="Delete category"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
                {onAddProject && (
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => onAddProject(category.id)}
                    title="Add project to this category"
                    sx={{ ml: 1 }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </ListItem>
            
            {category.subcategories && category.subcategories.length > 0 && (
              <Collapse 
                in={expanded[category.id]} 
                timeout="auto" 
                unmountOnExit
              >
                {renderCategories(category.subcategories, level + 1)}
              </Collapse>
            )}
          </Box>
        ))}
      </List>
    );
  };

  return (
    <>
      {categories.length > 0 ? (
        renderCategories(categories)
      ) : (
        <Typography 
          variant="body1" 
          color="text.secondary" 
          align="center"
          sx={{ py: 3 }}
        >
          No categories found.
        </Typography>
      )}
    </>
  );
}
