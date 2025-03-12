'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  GitHub as GitHubIcon,
  OpenInNew as OpenInNewIcon,
  ExitToApp as ExportIcon
} from '@mui/icons-material';

import { AwesomeList } from '@/types';
import ConfirmDialog from '@/components/UI/ConfirmDialog';

interface AwesomeListCardProps {
  awesomeList: AwesomeList;
  onDelete: (id: number) => Promise<void>;
}

export default function AwesomeListCard({
  awesomeList,
  onDelete
}: AwesomeListCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const handleDeleteClick = () => {
    closeMenu();
    setConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await onDelete(awesomeList.id);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setLoading(false);
      setConfirmDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialogOpen(false);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Extract GitHub owner and repo from repository URL
  const getGitHubInfo = () => {
    if (!awesomeList.repository_url) return { owner: '', repo: '' };

    try {
      const url = new URL(awesomeList.repository_url);
      const pathParts = url.pathname.split('/').filter(Boolean);

      if (pathParts.length >= 2 && url.hostname.includes('github.com')) {
        return {
          owner: pathParts[0],
          repo: pathParts[1]
        };
      }
    } catch (err) {
      console.error('Error parsing repository URL:', err);
    }

    return { owner: '', repo: '' };
  };

  const { owner, repo } = getGitHubInfo();

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardHeader
          title={
            <Typography variant="h6" component="div" noWrap>
              {awesomeList.title}
            </Typography>
          }
          action={
            <IconButton aria-label="settings" onClick={openMenu}>
              <MoreVertIcon />
            </IconButton>
          }
        />

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="body2" color="text.secondary" paragraph sx={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {awesomeList.description || 'No description provided.'}
          </Typography>

          {awesomeList.repository_url && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <GitHubIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
              <Typography
                variant="body2"
                color="text.secondary"
                noWrap
                sx={{ maxWidth: '200px' }}
              >
                {owner}/{repo}
              </Typography>
              <Tooltip title="View on GitHub">
                <IconButton
                  size="small"
                  href={awesomeList.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip
              size="small"
              label={`5 Categories`} // Hardcoded for testing
              color="primary"
              variant="outlined"
            />
            <Chip
              size="small"
              label={`10 Projects`} // Hardcoded for testing
              color="secondary"
              variant="outlined"
            />
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            component={Link}
            href={`/awesome-lists/${awesomeList.id}`}
            size="small"
          >
            View Details
          </Button>
        </CardActions>
      </Card>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
      >
        <MenuItem
          component={Link}
          href={`/awesome-lists/${awesomeList.id}`}
          onClick={closeMenu}
        >
          <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem
          component={Link}
          href={`/awesome-lists/${awesomeList.id}/edit`}
          onClick={closeMenu}
        >
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          component={Link}
          href={`/export/${awesomeList.id}`}
          onClick={closeMenu}
        >
          <ListItemIcon><ExportIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export to GitHub</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ color: 'error' }} />
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={confirmDialogOpen}
        title="Delete Awesome List"
        message={`Are you sure you want to delete "${awesomeList.title}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
        loading={loading}
        loadingText="Deleting..."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
}
