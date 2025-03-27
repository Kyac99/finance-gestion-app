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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import EmailIcon from '@mui/icons-material/Email';
import GetAppIcon from '@mui/icons-material/GetApp';
import axios from 'axios';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        // Simulons les données pour le développement
        setTimeout(() => {
          setInvoice({
            id: Number(id),
            reference: `FACT-${id.toString().padStart(4, '0')}`,
            sale_reference: `VTE-${id.toString().padStart(4, '0')}`,
            customer: {
              name: 'Marie Dupont',
              email: 'marie@example.com',
              address: '123 Rue Principale, Paris, 75001',
              phone: '+33 123 456 789'
            },
            company: {
              name: 'Ma Boutique Mode',
              address: '456 Avenue des Affaires, Paris, 75002',
              phone: '+33 987 654 321',
              email: 'contact@maboutiquemode.com',
              website: 'www.maboutiquemode.com',
              siret: '123 456 789 00012',
              vat: 'FR 12 345678901'
            },
            date: '2023-07-15',
            due_date: '2023-08-15',
            payment_date: '2023-07-15',
            payment_method: 'Carte bancaire',
            status: 'Payée',
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
            notes: 'Merci pour votre confiance !',
            created_at: '2023-07-15T10:30:00Z',
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Erreur lors du chargement de la facture:', err);
        setError('Erreur lors du chargement de la facture. Veuillez réessayer.');
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const handleSendEmail = () => {
    // Simulons l'envoi d'un email
    alert(`Facture envoyée par email à ${invoice.customer.email}`);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Payée':
        return 'success';
      case 'En attente':
        return 'warning';
      case 'Annulée':
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

  if (!invoice) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Facture non trouvée.</Alert>
        <Button
          component={Link}
          to="/invoices"
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
            to="/invoices"
            sx={{ mr: 2 }}
            startIcon={<ArrowBackIcon />}
          >
            Retour
          </Button>
          <Typography variant="h4" component="h1">
            {invoice.reference}
          </Typography>
          <Chip 
            label={invoice.status} 
            color={getStatusColor(invoice.status)}
            size="small"
            sx={{ ml: 2 }}
          />
        </Box>
        <Box>
          <Button
            variant="outlined"
            sx={{ mr: 1 }}
            startIcon={<EmailIcon />}
            onClick={handleSendEmail}
          >
            Envoyer par email
          </Button>
          <Button
            variant="outlined"
            sx={{ mr: 1 }}
            startIcon={<PrintIcon />}
          >
            Imprimer
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<GetAppIcon />}
          >
            Télécharger PDF
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 4, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>{invoice.company.name}</Typography>
            <Typography variant="body1">{invoice.company.address}</Typography>
            <Typography variant="body1">Tél: {invoice.company.phone}</Typography>
            <Typography variant="body1">Email: {invoice.company.email}</Typography>
            <Typography variant="body1">Site web: {invoice.company.website}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>SIRET: {invoice.company.siret}</Typography>
            <Typography variant="body2">TVA: {invoice.company.vat}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
            <Typography variant="h6" gutterBottom>FACTURE</Typography>
            <Typography variant="body1" gutterBottom><strong>N°:</strong> {invoice.reference}</Typography>
            <Typography variant="body1" gutterBottom><strong>Date:</strong> {formatDate(invoice.date)}</Typography>
            <Typography variant="body1" gutterBottom><strong>Échéance:</strong> {formatDate(invoice.due_date)}</Typography>
            <Typography variant="body1"><strong>Commande:</strong> <Link to={`/sales/${invoice.id}`}>{invoice.sale_reference}</Link></Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Facturer à:</Typography>
            <Typography variant="body1">{invoice.customer.name}</Typography>
            <Typography variant="body1">{invoice.customer.address}</Typography>
            <Typography variant="body1">Tél: {invoice.customer.phone}</Typography>
            <Typography variant="body1">Email: {invoice.customer.email}</Typography>
          </Grid>
          
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
            <Box sx={{ bgcolor: invoice.status === 'Payée' ? '#d4edda' : '#fff3cd', p: 2, borderRadius: 1, width: 'fit-content' }}>
              <Typography variant="h6" color={invoice.status === 'Payée' ? 'success.main' : 'warning.main'}>
                {invoice.status === 'Payée' ? 'PAYÉE' : 'EN ATTENTE DE PAIEMENT'}
              </Typography>
              {invoice.status === 'Payée' && (
                <Typography variant="body2">
                  Payée le {formatDate(invoice.payment_date)} par {invoice.payment_method}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 4 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Produit</strong></TableCell>
                  <TableCell align="right"><strong>Quantité</strong></TableCell>
                  <TableCell align="right"><strong>Prix unitaire</strong></TableCell>
                  <TableCell align="right"><strong>Total</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.items.map((item) => (
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
                  <TableCell align="right">{invoice.subtotal.toFixed(2)} €</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} />
                  <TableCell align="right">TVA (20%)</TableCell>
                  <TableCell align="right">{invoice.tax.toFixed(2)} €</TableCell>
                </TableRow>
                {invoice.discount > 0 && (
                  <TableRow>
                    <TableCell colSpan={2} />
                    <TableCell align="right">Remise</TableCell>
                    <TableCell align="right">-{invoice.discount.toFixed(2)} €</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell colSpan={2} />
                  <TableCell align="right">Livraison</TableCell>
                  <TableCell align="right">{invoice.shipping.toFixed(2)} €</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} />
                  <TableCell align="right" sx={{ borderTop: '2px solid black' }}>
                    <Typography variant="h6">Total</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ borderTop: '2px solid black' }}>
                    <Typography variant="h6">{invoice.total.toFixed(2)} €</Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Notes</Typography>
          <Typography variant="body1">{invoice.notes}</Typography>
        </Box>
        
        <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid #eee' }}>
          <Typography variant="body2" align="center" color="text.secondary">
            {invoice.company.name} - SIRET: {invoice.company.siret} - TVA: {invoice.company.vat}
          </Typography>
        </Box>
      </Paper>
      
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary">
            Facture créée le {formatDate(invoice.created_at)}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default InvoiceDetail;