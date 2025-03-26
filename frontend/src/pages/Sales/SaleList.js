import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptIcon from '@mui/icons-material/Receipt';
import axios from 'axios';

const SaleList = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Pour gérer les notifications
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setLoading(true);
        // Simulons les données pour le développement
        setTimeout(() => {
          setSales([
            { id: 1, customer: 'Marie Dupont', date: '2023-07-15', total: 1250.00, status: 'Livré', payment_status: 'Payé' },
            { id: 2, customer: 'Jean Martin', date: '2023-07-10', total: 850.00, status: 'En préparation', payment_status: 'Payé' },
            { id: 3, customer: 'Sophie Bernard', date: '2023-07-05', total: 320.00, status: 'Livré', payment_status: 'Non payé' },
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Erreur lors du chargement des ventes:', err);
        setError('Erreur lors du chargement des ventes. Veuillez réessayer.');
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Ventes
        </Typography>
        <Button
          component={Link}
          to="/sales/new"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          Nouvelle vente
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Référence</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Paiement</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>VTE-{sale.id.toString().padStart(4, '0')}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>{formatDate(sale.date)}</TableCell>
                  <TableCell>{sale.total.toFixed(2)} €</TableCell>
                  <TableCell>
                    <Chip 
                      label={sale.status} 
                      color={getStatusColor(sale.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={sale.payment_status} 
                      color={getPaymentStatusColor(sale.payment_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Voir détails">
                      <IconButton
                        component={Link}
                        to={`/sales/${sale.id}`}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Modifier">
                      <IconButton
                        component={Link}
                        to={`/sales/${sale.id}/edit`}
                        color="secondary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Facture">
                      <IconButton
                        component={Link}
                        to={`/invoices/${sale.id}`}
                        color="default"
                      >
                        <ReceiptIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={sales.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SaleList;