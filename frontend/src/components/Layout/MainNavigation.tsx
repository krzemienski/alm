'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Collapse, 
  Divider, 
  Tooltip,
  Box
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Add as AddIcon,
  Folder as FolderIcon,
  GitHub as GitHubIcon,
  ImportExport as ImportExportIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Info as InfoIcon
} from '@mui/icons-material';

export default function MainNavigation() {
  const pathname = usePathname();
  const [listsOpen, setListsOpen] = useState(true);
  
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  const handleToggleLists = () => {
    setListsOpen(!listsOpen);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <List component="nav" sx={{ py: 0 }}>
        <ListItemButton 
          component={Link} 
          href="/dashboard"
          selected={isActive('/dashboard')}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        
        <ListItemButton onClick={handleToggleLists}>
          <ListItemIcon>
            <FolderIcon />
          </ListItemIcon>
          <ListItemText primary="Awesome Lists" />
          {listsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItemButton>
        
        <Collapse in={listsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItemButton 
              component={Link} 
              href="/awesome-lists/new"
              selected={isActive('/awesome-lists/new')}
              sx={{ pl: 4 }}
            >
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="Create New List" />
            </ListItemButton>
          </List>
        </Collapse>
        
        <ListItemButton 
          component={Link} 
          href="/import-export"
          selected={isActive('/import-export')}
        >
          <ListItemIcon>
            <ImportExportIcon />
          </ListItemIcon>
          <ListItemText primary="Import & Export" />
        </ListItemButton>
        
        <Divider sx={{ my: 1 }} />
        
        <ListItemButton 
          component="a" 
          href="https://github.com/sindresorhus/awesome" 
          target="_blank"
          rel="noopener noreferrer"
        >
          <ListItemIcon>
            <GitHubIcon />
          </ListItemIcon>
          <ListItemText primary="Awesome Guidelines" />
        </ListItemButton>
        
        <ListItemButton 
          component={Link} 
          href="/settings"
          selected={isActive('/settings')}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>
        
        <ListItemButton 
          component={Link} 
          href="/about"
          selected={isActive('/about')}
        >
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText primary="About" />
        </ListItemButton>
      </List>
    </Box>
  );
}
