import { Outlet } from 'react-router-dom';
import { Box }    from '@mui/material';
import Navbar     from './Navbar';

const Layout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        backgroundImage: (theme) =>
          `radial-gradient(ellipse 120% 80% at 50% -20%, ${theme.palette.primary.main}14, transparent 50%), radial-gradient(ellipse 80% 60% at 100% 100%, ${theme.palette.secondary.main}12, transparent 45%)`,
      }}
    >
      <Navbar />
      <Box
        component="main"
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2.5, md: 4 },
          pb: 6,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;