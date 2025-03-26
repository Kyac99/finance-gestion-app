import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        // Dans un environnement réel, cela devrait être remplacé par un appel API
        // const response = await axios.get(`/api/suppliers/${id}/`);
        // setSupplier(response.data);
        
        // Simulons les données pour le développement
        setTimeout(() => {
          setSupplier({
            id: Number(id),
            name: 'Fournisseur A',
            contact: 'Jean Dupont',
            email: 'jean@fournisseura.com',
            phone: '+1234567890',
            address: 'Paris',
            website: 'https://fournisseur-a.com',
            notes: 'Fournisseur de qualité avec livraison rapide.',
            active: true,
            created_at: '2023-05-10T14:30:00Z',
            updated_at: '2023-06-15T09:45:00Z',
            // Ajoutez d'autres données selon vos besoins
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Erreur lors du chargement du fournisseur:', err);
        setError('Erreur lors du chargement du fournisseur. Veuillez réessayer.');
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Dans un environnement réel, envoyez une requête DELETE
      // await axios.delete(`/api/suppliers/${id}/`);
      
      // Simulons la suppression pour le développement
      setTimeout(() => {
        setDeleteDialogOpen(false);
        navigate('/suppliers', { state: { alertMessage: 'Fournisseur supprimé avec succès.', alertSeverity: 'success' } });
      }, 1000);
    } catch (err) {
      console.error('Erreur lors de la suppression du fournisseur:', err);
      setError('Erreur lors de la suppression du fournisseur. Veuillez réessayer.');
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!supplier) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Fournisseur non trouvé.</Alert>
        <Button
          component={Link}
          to="/suppliers"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Retour à la liste
        </Button>
      </Box>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            component={Link}
            to="/suppliers"
            sx={{ mr: 2 }}
            startIcon={<ArrowBackIcon />}
          >
            Retour
          </Button>
          <Typography variant="h4" component="h1">
            {supplier.name}
          </Typography>
          {supplier.active ? (
            <Chip label="Actif" color="success" sx={{ ml: 2 }} />
          ) : (
            <Chip label="Inactif" color="error" sx={{ ml: 2 }} />
          )}
        </Box>
        <Box>
          <Button
            component={Link}
            to={`/suppliers/${id}/edit`}
            variant="outlined"
            color="primary"
            sx={{ mr: 1 }}
            startIcon={<EditIcon />}
          >
            Modifier
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteClick}
            startIcon={<DeleteIcon />}
          >
            Supprimer
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Informations générales</Typography>
            <Divider sx={{ mb: 2 }} />
            <List disablePadding>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText primary="Contact" secondary={supplier.contact} />
              </ListItem>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText primary="Email" secondary={supplier.email} />
              </ListItem>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText primary="Téléphone" secondary={supplier.phone} />
              </ListItem>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText primary="Adresse" secondary={supplier.address} />
              </ListItem>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText primary="Site Web" secondary={supplier.website} />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Notes</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              {supplier.notes || 'Aucune note disponible.'}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Créé le {formatDate(supplier.created_at)}
                {supplier.updated_at && ` • Dernière modification le ${formatDate(supplier.updated_at)}`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogue de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer définitivement ce fournisseur ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Annuler
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplierDetail;