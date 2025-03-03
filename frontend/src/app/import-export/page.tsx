'use client';

import { useState } from 'react';
import { 
  Box, 
  Container, 
  Tabs, 
  Tab, 
  Typography,
  Paper
} from '@mui/material';
import { 
  CloudDownload as CloudDownloadIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';

import AppLayout from '@/components/Layout/AppLayout';
import PageHeader from '@/components/UI/PageHeader';
import ImportForm from './components/ImportForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`import-export-tabpanel-${index}`}
      aria-labelledby={`import-export-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ImportExportPage() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <AppLayout>
      <Container maxWidth="lg">
        <PageHeader
          title="Import & Export"
          subtitle="Manage your awesome lists from GitHub repositories"
        />

        <Paper>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              label="Import from GitHub" 
              icon={<CloudUploadIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Export Documentation" 
              icon={<CloudDownloadIcon />}
              iconPosition="start"
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <ImportForm />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Export Awesome Lists to GitHub
              </Typography>
              <Typography paragraph>
                To export an awesome list to GitHub, navigate to the specific awesome list's detail page and use the export button there.
              </Typography>
              <Typography paragraph>
                The export process will:
              </Typography>
              <ul>
                <li>
                  <Typography>
                    Generate a properly formatted README.md file according to the awesome list community standards
                  </Typography>
                </li>
                <li>
                  <Typography>
                    Validate all links to ensure they are working properly
                  </Typography>
                </li>
                <li>
                  <Typography>
                    Create a new branch and pull request in the GitHub repository (optional)
                  </Typography>
                </li>
                <li>
                  <Typography>
                    Provide a downloadable version of the README.md file
                  </Typography>
                </li>
              </ul>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </AppLayout>
  );
}
