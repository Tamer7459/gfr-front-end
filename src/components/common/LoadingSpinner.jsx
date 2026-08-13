'use client'
import { Box, CircularProgress } from '@mui/material';

const LoadingSpinner = () => {
  return (
    <Box
      sx={{
        display:        'flex',
        justifyContent: 'center',
        alignItems:     'center',
        minHeight:      '100vh',
        bgcolor:        'background.default',
      }}
    >
      <CircularProgress size={48} />
    </Box>
  );
};

export default LoadingSpinner;