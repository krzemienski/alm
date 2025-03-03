'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Chip,
  Tooltip
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon
} from '@mui/icons-material';
import Link from 'next/link';

import ConfirmDialog from '@/components/UI/ConfirmDialog';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
  awesomeListId: string;
  onDelete?: (categoryId: number) => void;
}

export default function CategoryCard({ category, awesomeListId, onDelete }: CategoryCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleDelete = () => {
    handleMenuClose();
    setConfirmOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(category.id);
    }
    setConfirmOpen(false);
  };
  
  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="div" noWrap>
              {category.name}
            </Typography>
            <IconButton 
              size="small" 
              onClick={handleMenuOpen}
              aria-label="Category options"
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            {category.parent_category_id ? (
              <Tooltip title="This is a subcategory">
                <Chip 
                  label="Subcategory" 
                  size="small" 
                  color="secondary" 
                  variant="outlined" 
                />
              </Tooltip>
            ) : (
              <Tooltip title="Top-level category">
                <Chip 
                  label="Main Category" 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              </Tooltip>
            )}
            
            <Typography variant="body2" color="text.secondary">
              {/* Default to 0 as projects_count is not in the base Category type */}
              0 projects
            </Typography>
          </Box>
        </CardContent>
        
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 1,
            pt: 0,
            gap: 1 
          }}
        >
          <Tooltip title="View Projects">
            <IconButton 
              component={Link}
              href={`/awesome-lists/${awesomeListId}/categories/${category.id}`}
              size="small" 
              color="primary"
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Add Project">
            <IconButton 
              component={Link}
              href={`/awesome-lists/${awesomeListId}/categories/${category.id}/projects/new`}
              size="small" 
              color="secondary"
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Card>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          component={Link}
          href={`/awesome-lists/${awesomeListId}/categories/${category.id}`}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Projects</ListItemText>
        </MenuItem>
        <MenuItem 
          component={Link}
          href={`/awesome-lists/${awesomeListId}/categories/${category.id}/edit`}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem 
          component={Link}
          href={`/awesome-lists/${awesomeListId}/categories/${category.id}/projects/new`}
          onClick={handleMenuClose}
        >
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Project</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ color: 'error' }}>
            Delete
          </ListItemText>
        </MenuItem>
      </Menu>
      
      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete '${category.name}'? This will also delete all projects within this category. This action cannot be undone.`}
      />
    </>
  );
}
