import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (isEditMode) {
      const fetchCustomer = async () => {
        try {
          // Simulons les données pour le développement
          setTimeout(() => {
            setFormData({
              name: 'Marie Dupont',
              email: 'marie@example.com',
              phone: '+1234567890',
              address: 'Paris',
              notes: 'Cliente fidèle depuis 2020.'
            });
            setLoading(false);
          }, 1000);
        } catch (err) {
          console.error('Erreur lors du chargement du client:', err);
          setError('Erreur lors du chargement du client. Veuillez réessayer.');
          setLoading(false);
        }
      };

      fetchCustomer();
    }
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Supprimer l'erreur de validation lors de la modification du champ
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Le téléphone est requis';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      if (isEditMode) {
        // Simulons la mise à jour pour le développement
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate(`/customers/${id}`, { state: { alertMessage: 'Client mis à jour avec succès.', alertSeverity: 'success' } });
      } else {
        // Simulons la création pour le développement
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/customers', { state: { alertMessage: 'Client créé avec succès.', alertSeverity: 'success' } });
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du client:', err);
      setError('Erreur lors de la sauvegarde du client. Veuillez réessayer.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/customers"
          sx={{ mr: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Retour
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Modifier le client' : 'Ajouter un client'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Informations générales</Typography>
              <Divider sx={{ my: 1 }} />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Nom complet *"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                error={!!validationErrors.name}
                helperText={validationErrors.name}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="email"
                label="Email *"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                error={!!validationErrors.email}
                helperText={validationErrors.email}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Téléphone *"
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
                error={!!validationErrors.phone}
                helperText={validationErrors.phone}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Adresse"
                value={formData.address}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Notes"
                value={formData.notes}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                component={Link}
                to="/customers"
                variant="outlined"
                color="inherit"
                sx={{ mr: 1 }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default CustomerForm;