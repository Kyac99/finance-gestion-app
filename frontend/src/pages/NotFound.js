import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, Typography, Container } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          py: 8,
        }}
      >
        <Typography variant="h1" color="text.secondary" sx={{ mb: 2, fontSize: { xs: '3rem', md: '4rem' } }}>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Page non trouvée
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          La page que vous recherchez n'existe pas ou a été déplacée.
        </Typography>
        <Button
          component={Link}
          to="/"
          variant="contained"
          startIcon={<HomeIcon />}
        >
          Retour à l'accueil
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;