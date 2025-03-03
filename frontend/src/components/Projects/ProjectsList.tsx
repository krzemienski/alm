'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Tooltip, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Chip
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { Project } from '@/types';
import LoadingButton from '@/components/UI/LoadingButton';

interface ProjectsListProps {
  projects: Project[];
  listId: number;
  categoryId?: number;
  onDelete: (id: number) => Promise<void>;
}

export default function ProjectsList({ 
  projects, 
  listId,
  categoryId,
  onDelete
}: ProjectsListProps) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, projectId: number) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveProjectId(projectId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (activeProjectId === null) return;
    
    try {
      setLoading(true);
      await onDelete(activeProjectId);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setActiveProjectId(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setActiveProjectId(null);
  };

  const getActiveProject = () => {
    return projects.find(project => project.id === activeProjectId);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return 'No description';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (projects.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No projects found in this category.
        </Typography>
        {categoryId && (
          <Button 
            component={Link}
            href={`/awesome-lists/${listId}/categories/${categoryId}/projects/new`}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Add Project
          </Button>
        )}
      </Paper>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                    <Typography variant="body1" fontWeight="medium">
                      {project.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <LinkIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        component="a"
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {truncateText(project.url, 35)}
                      </Typography>
                      <IconButton 
                        size="small" 
                        href={project.url} 
                        target="_blank"
                        sx={{ ml: 0.5 }}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {project.description ? (
                    <Typography variant="body2">
                      {truncateText(project.description, 100)}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      No description
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Project actions">
                    <IconButton
                      aria-label="project actions"
                      onClick={(e) => handleMenuOpen(e, project.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          component={Link} 
          href={`/awesome-lists/${listId}/projects/${activeProjectId}/edit`}
          onClick={handleMenuClose}
        >
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit Project</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ color: 'error' }} />
        </MenuItem>
      </Menu>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project "{getActiveProject()?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={loading}>
            Cancel
          </Button>
          <LoadingButton 
            onClick={handleDeleteConfirm} 
            color="error" 
            loading={loading}
            loadingText="Deleting..."
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
