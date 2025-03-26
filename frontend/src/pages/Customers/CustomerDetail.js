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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import axios from 'axios';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        setLoading(true);
        // Simulons les données pour le développement
        setTimeout(() => {
          setCustomer({
            id: Number(id),
            name: 'Marie Dupont',
            email: 'marie@example.com',
            phone: '+1234567890',
            address: 'Paris',
            notes: 'Cliente fidèle depuis 2020.',
            totalPurchases: 3450.00,
            lastPurchaseDate: '2023-07-15',
            purchases: [
              { id: 1, date: '2023-07-15', total: 1250.00, status: 'Livré', items: 3 },
              { id: 2, date: '2023-05-22', total: 850.00, status: 'Livré', items: 2 },
              { id: 3, date: '2023-03-10', total: 1350.00, status: 'Livré', items: 4 }
            ],
            created_at: '2020-03-15T10:30:00Z',
            updated_at: '2023-07-15T14:45:00Z'
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
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Simulons la suppression pour le développement
      setTimeout(() => {
        setDeleteDialogOpen(false);
        navigate('/customers', { state: { alertMessage: 'Client supprimé avec succès.', alertSeverity: 'success' } });
      }, 1000);
    } catch (err) {
      console.error('Erreur lors de la suppression du client:', err);
      setError('Erreur lors de la suppression du client. Veuillez réessayer.');
      setDeleteDialogOpen(false);
    }
  };

  // Format de date pour l'affichage
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
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

  if (!customer) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Client non trouvé.</Alert>
        <Button
          component={Link}
          to="/customers"
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            component={Link}
            to="/customers"
            sx={{ mr: 2 }}
            startIcon={<ArrowBackIcon />}
          >
            Retour
          </Button>
          <Typography variant="h4" component="h1">
            {customer.name}
          </Typography>
        </Box>
        <Box>
          <Button
            component={Link}
            to={`/sales/new?customer=${customer.id}`}
            variant="outlined"
            color="primary"
            sx={{ mr: 1 }}
            startIcon={<ShoppingCartIcon />}
          >
            Nouvelle vente
          </Button>
          <Button
            component={Link}
            to={`/customers/${id}/edit`}
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
            <Typography variant="h6" gutterBottom>Informations de contact</Typography>
            <Divider sx={{ mb: 2 }} />
            <List disablePadding>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText primary="Email" secondary={customer.email} />
              </ListItem>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText primary="Téléphone" secondary={customer.phone} />
              </ListItem>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText primary="Adresse" secondary={customer.address} />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Informations d'achat</Typography>
            <Divider sx={{ mb: 2 }} />
            <List disablePadding>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText 
                  primary="Total des achats" 
                  secondary={`${customer.totalPurchases.toFixed(2)} €`} 
                />
              </ListItem>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText 
                  primary="Dernier achat" 
                  secondary={customer.lastPurchaseDate ? formatDate(customer.lastPurchaseDate) : 'Aucun'} 
                />
              </ListItem>
              <ListItem disablePadding sx={{ py: 1 }}>
                <ListItemText 
                  primary="Nombre d'achats" 
                  secondary={customer.purchases ? customer.purchases.length : 0} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Notes</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              {customer.notes || 'Aucune note disponible.'}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Historique des achats</Typography>
            <Divider sx={{ mb: 2 }} />
            {customer.purchases && customer.purchases.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Référence</TableCell>
                      <TableCell align="right">Montant</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="right">Articles</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customer.purchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>{formatDate(purchase.date)}</TableCell>
                        <TableCell>VTE-{purchase.id.toString().padStart(4, '0')}</TableCell>
                        <TableCell align="right">{purchase.total.toFixed(2)} €</TableCell>
                        <TableCell>
                          <Chip 
                            label={purchase.status} 
                            color={purchase.status === 'Livré' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{purchase.items}</TableCell>
                        <TableCell>
                          <Button
                            component={Link}
                            to={`/sales/${purchase.id}`}
                            size="small"
                          >
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Aucun achat enregistré pour ce client.
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Client depuis le {formatDate(customer.created_at)}
                {customer.updated_at && ` • Dernière modification le ${formatDate(customer.updated_at)}`}
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
            Êtes-vous sûr de vouloir supprimer définitivement ce client ? Cette action est irréversible.
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

export default CustomerDetail;