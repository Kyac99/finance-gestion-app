import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AddCircle as AddCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Enregistrement des composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Fonction pour obtenir les paiements fournisseurs
const fetchSupplierPayments = async () => {
  const { data } = await axios.get('/api/dashboard/supplier_payments/');
  return data;
};

// Fonction pour obtenir les paiements clients
const fetchCustomerPayments = async () => {
  const { data } = await axios.get('/api/dashboard/customer_payments/');
  return data;
};

// Fonction pour obtenir les produits en stock bas
const fetchLowStockProducts = async () => {
  const { data } = await axios.get('/api/dashboard/low_stock_products/');
  return data;
};

// Fonction pour obtenir le résumé des ventes
const fetchSalesSummary = async () => {
  const { data } = await axios.get('/api/dashboard/sales_summary/');
  return data;
};

const Dashboard = () => {
  // Requêtes avec React Query
  const supplierPayments = useQuery('supplierPayments', fetchSupplierPayments, {
    staleTime: 300000, // 5 minutes
  });
  
  const customerPayments = useQuery('customerPayments', fetchCustomerPayments, {
    staleTime: 300000,
  });
  
  const lowStockProducts = useQuery('lowStockProducts', fetchLowStockProducts, {
    staleTime: 300000,
  });
  
  const salesSummary = useQuery('salesSummary', fetchSalesSummary, {
    staleTime: 300000,
  });

  // Préparer les données pour le graphique des ventes
  const salesChartData = React.useMemo(() => {
    if (!salesSummary.data?.sales_by_month) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Montant des ventes',
            data: [],
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      };
    }

    return {
      labels: salesSummary.data.sales_by_month.map(item => {
        const date = new Date(item.month);
        return `${date.getMonth() + 1}/${date.getFullYear()}`;
      }),
      datasets: [
        {
          label: 'Montant des ventes',
          data: salesSummary.data.sales_by_month.map(item => item.total),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
      ],
    };
  }, [salesSummary.data]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Ventes des 6 derniers mois',
      },
    },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Tableau de bord
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => {
            supplierPayments.refetch();
            customerPayments.refetch();
            lowStockProducts.refetch();
            salesSummary.refetch();
          }}
          startIcon={<RefreshIcon />}
        >
          Actualiser
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Graphique des ventes */}
        <Grid item xs={12} md={8}>
          <Card className="dashboard-card">
            <CardHeader title="Évolution des ventes" />
            <CardContent className="dashboard-card-content">
              {salesSummary.isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : salesSummary.error ? (
                <Alert severity="error">Erreur lors du chargement des données</Alert>
              ) : (
                <Box sx={{ height: 300 }}>
                  <Line options={chartOptions} data={salesChartData} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Produits en stock bas */}
        <Grid item xs={12} md={4}>
          <Card className="dashboard-card">
            <CardHeader 
              title="Stocks faibles" 
              action={
                <IconButton component={Link} to="/products" size="small">
                  <WarningIcon color="warning" />
                </IconButton>
              }
            />
            <CardContent className="dashboard-card-content">
              {lowStockProducts.isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : lowStockProducts.error ? (
                <Alert severity="error">Erreur lors du chargement des données</Alert>
              ) : lowStockProducts.data && lowStockProducts.data.length === 0 ? (
                <Alert severity="info">Aucun produit en stock bas</Alert>
              ) : (
                <List>
                  {lowStockProducts.data?.slice(0, 5).map((product) => (
                    <React.Fragment key={product.id}>
                      <ListItem>
                        <ListItemText
                          primary={product.name}
                          secondary={`Stock: ${product.stock_quantity}`}
                        />
                        <Chip 
                          size="small" 
                          color="warning" 
                          label={`${product.stock_quantity} restants`} 
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                color="primary" 
                component={Link} 
                to="/products"
              >
                Voir tous les produits
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Paiements fournisseurs */}
        <Grid item xs={12} md={6}>
          <Card className="dashboard-card">
            <CardHeader 
              title="Paiements fournisseurs en attente" 
              action={
                <IconButton component={Link} to="/purchases/new">
                  <AddCircleIcon color="primary" />
                </IconButton>
              }
            />
            <CardContent className="dashboard-card-content">
              {supplierPayments.isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : supplierPayments.error ? (
                <Alert severity="error">Erreur lors du chargement des données</Alert>
              ) : supplierPayments.data && supplierPayments.data.length === 0 ? (
                <Alert severity="info">Aucun paiement en attente</Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fournisseur</TableCell>
                        <TableCell>Date d'échéance</TableCell>
                        <TableCell align="right">Montant</TableCell>
                        <TableCell>Statut</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {supplierPayments.data?.slice(0, 5).map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.supplier_name}</TableCell>
                          <TableCell>
                            {payment.payment_due_date 
                              ? new Date(payment.payment_due_date).toLocaleDateString() 
                              : 'Non définie'}
                          </TableCell>
                          <TableCell align="right">
                            {payment.balance_due?.toLocaleString()} €
                          </TableCell>
                          <TableCell>
                            <Chip 
                              size="small" 
                              color={payment.is_overdue ? "error" : "warning"} 
                              label={payment.is_overdue ? "En retard" : "À payer"} 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                color="primary" 
                component={Link} 
                to="/purchases"
              >
                Voir tous les achats
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Paiements clients */}
        <Grid item xs={12} md={6}>
          <Card className="dashboard-card">
            <CardHeader 
              title="Paiements clients en attente" 
              action={
                <IconButton component={Link} to="/sales/new">
                  <AddCircleIcon color="primary" />
                </IconButton>
              }
            />
            <CardContent className="dashboard-card-content">
              {customerPayments.isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : customerPayments.error ? (
                <Alert severity="error">Erreur lors du chargement des données</Alert>
              ) : customerPayments.data && customerPayments.data.length === 0 ? (
                <Alert severity="info">Aucun paiement en attente</Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Client</TableCell>
                        <TableCell>Date de livraison</TableCell>
                        <TableCell align="right">Montant</TableCell>
                        <TableCell>Jours</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {customerPayments.data?.slice(0, 5).map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.customer_name}</TableCell>
                          <TableCell>
                            {payment.actual_delivery_date 
                              ? new Date(payment.actual_delivery_date).toLocaleDateString() 
                              : 'Non livrée'}
                          </TableCell>
                          <TableCell align="right">
                            {payment.balance_due?.toLocaleString()} €
                          </TableCell>
                          <TableCell>
                            {payment.days_since_delivery ? (
                              <Chip 
                                size="small" 
                                color={payment.days_since_delivery > 30 ? "error" : "warning"} 
                                label={`${payment.days_since_delivery} jours`} 
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                color="primary" 
                component={Link} 
                to="/sales"
              >
                Voir toutes les ventes
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Raccourcis d'actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Actions rapides
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to="/sales/new"
                  startIcon={<TrendingUpIcon />}
                >
                  Nouvelle vente
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to="/purchases/new"
                  startIcon={<TrendingDownIcon />}
                >
                  Nouvel achat
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to="/customers/new"
                  startIcon={<AddCircleIcon />}
                >
                  Nouveau client
                </Button>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  component={Link}
                  to="/products/new"
                  startIcon={<AddCircleIcon />}
                >
                  Nouveau produit
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;