'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Category as CategoryIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { AwesomeList } from '@/types';
import LoadingButton from '@/components/UI/LoadingButton';

interface AwesomeListCardProps {
  awesomeList: AwesomeList;
  onDelete: (id: number) => Promise<void>;
}

export default function AwesomeListCard({ awesomeList, onDelete }: AwesomeListCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await onDelete(awesomeList.id);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const repositoryName = () => {
    if (!awesomeList.repository_url) return 'N/A';

    const url = new URL(awesomeList.repository_url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      return `${pathParts[0]}/${pathParts[1]}`;
    }
    return awesomeList.repository_url;
  };

  return (
    <>
      <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
              {awesomeList.title}
            </Typography>
            <IconButton size="small" onClick={handleMenuOpen} aria-label="options">
              <MoreVertIcon />
            </IconButton>
          </Box>

          <Typography color="text.secondary" variant="body2" paragraph>
            {awesomeList.description || 'No description available'}
          </Typography>

          {awesomeList.repository_url && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <GitHubIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {repositoryName()}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label={`${awesomeList.categories_count || 0} Categories`}
              icon={<CategoryIcon />}
            />
            <Chip
              size="small"
              label={`${awesomeList.projects_count || 0} Projects`}
              icon={<VisibilityIcon />}
            />
          </Box>
        </CardContent>

        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            variant="contained"
            component={Link}
            href={`/awesome-lists/${awesomeList.id}`}
            fullWidth
          >
            View Details
          </Button>
        </CardActions>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          component={Link}
          href={`/awesome-lists/${awesomeList.id}`}
          onClick={handleMenuClose}
        >
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          href={`/awesome-lists/${awesomeList.id}/edit`}
          onClick={handleMenuClose}
        >
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>

        <MenuItem
          component={Link}
          href={`/export/${awesomeList.id}`}
          onClick={handleMenuClose}
        >
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export</ListItemText>
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
        <DialogTitle>Delete Awesome List</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the awesome list "{awesomeList.title}"? This action cannot be undone.
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
