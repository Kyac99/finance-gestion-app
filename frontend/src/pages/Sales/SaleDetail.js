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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import EmailIcon from '@mui/icons-material/Email';
import axios from 'axios';

const SaleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchSale = async () => {
      try {
        setLoading(true);
        // Simulons les données pour le développement
        setTimeout(() => {
          setSale({
            id: Number(id),
            reference: `VTE-${id.toString().padStart(4, '0')}`,
            customer: 'Marie Dupont',
            customer_id: 1,
            customer_email: 'marie@example.com',
            customer_address: 'Paris',
            customer_phone: '+1234567890',
            date: '2023-07-15',
            shipping_date: '2023-07-18',
            status: 'Livré',
            payment_status: 'Payé',
            payment_date: '2023-07-15',
            payment_method: 'Carte bancaire',
            items: [
              { id: 1, product: 'Sac à main en cuir', quantity: 1, unit_price: 149.99, total: 149.99 },
              { id: 2, product: 'Portefeuille', quantity: 2, unit_price: 49.99, total: 99.98 },
              { id: 3, product: 'Chaussures à talons', quantity: 1, unit_price: 89.99, total: 89.99 }
            ],
            subtotal: 339.96,
            tax: 68.00,
            shipping: 15.00,
            discount: 10.00,
            total: 412.96,
            notes: 'Livraison express demandée par la cliente.',
            created_at: '2023-07-15T10:30:00Z',
            updated_at: '2023-07-18T14:45:00Z'
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Erreur lors du chargement de la vente:', err);
        setError('Erreur lors du chargement de la vente. Veuillez réessayer.');
        setLoading(false);
      }
    };

    fetchSale();
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
        navigate('/sales', { state: { alertMessage: 'Vente supprimée avec succès.', alertSeverity: 'success' } });
      }, 1000);
    } catch (err) {
      console.error('Erreur lors de la suppression de la vente:', err);
      setError('Erreur lors de la suppression de la vente. Veuillez réessayer.');
      setDeleteDialogOpen(false);
    }
  };

  const handleSendInvoice = () => {
    // Simulons l'envoi d'une facture par email
    alert(`Un email avec la facture a été envoyé à ${sale.customer_email}`);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Livré':
        return 'success';
      case 'En préparation':
        return 'warning';
      case 'Annulé':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch(status) {
      case 'Payé':
        return 'success';
      case 'Partiel':
        return 'warning';
      case 'Non payé':
        return 'error';
      default:
        return 'default';
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

  if (!sale) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Vente non trouvée.</Alert>
        <Button
          component={Link}
          to="/sales"
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
            to="/sales"
            sx={{ mr: 2 }}
            startIcon={<ArrowBackIcon />}
          >
            Retour
          </Button>
          <Typography variant="h4" component="h1">
            {sale.reference}
          </Typography>
          <Chip 
            label={sale.status} 
            color={getStatusColor(sale.status)}
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>
        <Box>
          <Button
            variant="outlined"
            sx={{ mr: 1 }}
            startIcon={<EmailIcon />}
            onClick={handleSendInvoice}
          >
            Envoyer facture
          </Button>
          <Button
            component={Link}
            to={`/invoices/${id}`}
            variant="outlined"
            sx={{ mr: 1 }}
            startIcon={<ReceiptIcon />}
          >
            Voir facture
          </Button>
          <Button
            component={Link}
            to={`/sales/${id}/edit`}
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
            <Typography variant="h6" gutterBottom>Client</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Nom</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <Link to={`/customers/${sale.customer_id}`} style={{ textDecoration: 'none' }}>
                    {sale.customer}
                  </Link>
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{sale.customer_email}</Typography>
                
                <Typography variant="subtitle2" color="text.secondary">Téléphone</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{sale.customer_phone}</Typography>
                
                <Typography variant="subtitle2" color="text.secondary">Adresse de livraison</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{sale.customer_address}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Détails de la commande</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Date de commande</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{formatDate(sale.date)}</Typography>
                
                <Typography variant="subtitle2" color="text.secondary">Date de livraison</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {sale.shipping_date ? formatDate(sale.shipping_date) : 'Non livré'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <Chip 
                    label={sale.status} 
                    color={getStatusColor(sale.status)}
                    size="small"
                  />
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">Statut de paiement</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <Chip 
                    label={sale.payment_status} 
                    color={getPaymentStatusColor(sale.payment_status)}
                    size="small"
                  />
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Articles commandés</Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produit</TableCell>
                    <TableCell align="right">Quantité</TableCell>
                    <TableCell align="right">Prix unitaire</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sale.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.product}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{item.unit_price.toFixed(2)} €</TableCell>
                      <TableCell align="right">{item.total.toFixed(2)} €</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right"><strong>Sous-total</strong></TableCell>
                    <TableCell align="right">{sale.subtotal.toFixed(2)} €</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right">TVA (20%)</TableCell>
                    <TableCell align="right">{sale.tax.toFixed(2)} €</TableCell>
                  </TableRow>
                  {sale.discount > 0 && (
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell align="right">Remise</TableCell>
                      <TableCell align="right">-{sale.discount.toFixed(2)} €</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right">Livraison</TableCell>
                    <TableCell align="right">{sale.shipping.toFixed(2)} €</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right"><Typography variant="h6">Total</Typography></TableCell>
                    <TableCell align="right"><Typography variant="h6">{sale.total.toFixed(2)} €</Typography></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Paiement</Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Méthode de paiement</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{sale.payment_method}</Typography>
                
                <Typography variant="subtitle2" color="text.secondary">Date de paiement</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {sale.payment_date ? formatDate(sale.payment_date) : 'Non payé'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">Statut</Typography>
                <Typography variant="body1">
                  <Chip 
                    label={sale.payment_status} 
                    color={getPaymentStatusColor(sale.payment_status)}
                    size="small"
                  />
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Notes</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              {sale.notes || 'Aucune note disponible.'}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Créée le {formatDate(sale.created_at)}
                {sale.updated_at && ` • Dernière modification le ${formatDate(sale.updated_at)}`}
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
            Êtes-vous sûr de vouloir supprimer définitivement cette vente ? Cette action est irréversible.
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

export default SaleDetail;