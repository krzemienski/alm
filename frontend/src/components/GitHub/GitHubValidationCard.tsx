'use client';

import { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  GitHub as GitHubIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { githubApi } from '@/services/api';
import { ValidationResult } from '@/types';
import LoadingButton from '@/components/UI/LoadingButton';

interface GitHubValidationCardProps {
  repositoryUrl: string;
  onValidationComplete?: (isValid: boolean) => void;
}

export default function GitHubValidationCard({ 
  repositoryUrl,
  onValidationComplete
}: GitHubValidationCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<{
    repository?: any;
    links?: ValidationResult;
    readme?: ValidationResult;
    isValid: boolean;
  }>({
    isValid: false
  });

  const extractRepoInfo = (url: string) => {
    // Extract owner and repo from GitHub URL
    const regex = /github\.com\/([^/]+)\/([^/]+)/;
    const match = url.match(regex);
    
    if (match && match[1] && match[2]) {
      return { owner: match[1], repo: match[2].replace('.git', '') };
    }
    
    return null;
  };

  const handleValidate = async () => {
    if (!repositoryUrl) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    const repoInfo = extractRepoInfo(repositoryUrl);
    
    if (!repoInfo) {
      setError('Invalid GitHub repository URL. Format should be: https://github.com/owner/repo');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Validate repository
      const repoData = await githubApi.validateRepository(repoInfo.owner, repoInfo.repo);
      
      // Check links
      const linksResult = await githubApi.checkLinks(repoInfo.owner, repoInfo.repo);
      
      // Lint README
      const readmeResult = await githubApi.lintReadme(repoInfo.owner, repoInfo.repo);
      
      const isValid = linksResult.success && readmeResult.success;
      
      setValidationResults({
        repository: repoData,
        links: linksResult,
        readme: readmeResult,
        isValid
      });
      
      if (onValidationComplete) {
        onValidationComplete(isValid);
      }
    } catch (err) {
      console.error('Validation failed:', err);
      setError('Failed to validate repository. Please check the URL and try again.');
      
      if (onValidationComplete) {
        onValidationComplete(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Repository Validation
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography>
            {repositoryUrl || 'No repository specified'}
          </Typography>
        </Box>
        
        <LoadingButton
          variant="contained"
          onClick={handleValidate}
          loading={loading}
          loadingText="Validating..."
          disabled={!repositoryUrl}
        >
          Validate Repository
        </LoadingButton>
      </Paper>
      
      {validationResults.repository && (
        <Box sx={{ mb: 3 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Repository Information
              </Typography>
              <Typography variant="body1">
                {validationResults.repository.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {validationResults.repository.description || 'No description'}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <Box>
                  <Typography variant="subtitle2">Owner:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {validationResults.repository.owner?.login}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Stars:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {validationResults.repository.stars || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Forks:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {validationResults.repository.forks || 0}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ValidationResultCard 
                title="Link Validation"
                result={validationResults.links}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ValidationResultCard 
                title="README Format"
                result={validationResults.readme}
              />
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            {validationResults.isValid ? (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                Repository is valid and ready to be imported as an awesome list.
              </Alert>
            ) : (
              <Alert severity="warning" icon={<ErrorIcon />}>
                Repository has validation issues that should be addressed before importing.
              </Alert>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

interface ValidationResultCardProps {
  title: string;
  result?: ValidationResult;
}

function ValidationResultCard({ title, result }: ValidationResultCardProps) {
  if (!result) return null;
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {result.success ? (
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
          ) : (
            <ErrorIcon color="error" sx={{ mr: 1 }} />
          )}
          <Typography variant="h6">
            {title}
          </Typography>
        </Box>
        
        {result.issues && result.issues.length > 0 ? (
          <List dense>
            {result.issues.map((issue, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <ErrorIcon color="warning" />
                </ListItemIcon>
                <ListItemText primary={issue} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary">
            No issues found. All validations passed.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
