import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  MenuItem,
  Grid,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

const StockMovementList = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filtres
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        setLoading(true);
        // Simulons les données pour le développement
        setTimeout(() => {
          setMovements([
            { 
              id: 1, 
              date: '2023-07-15', 
              product: 'Sac à main en cuir', 
              type: 'Entrée', 
              quantity: 10, 
              reference: 'ACH-0001',
              user: 'Admin'
            },
            { 
              id: 2, 
              date: '2023-07-16', 
              product: 'Sac à main en cuir', 
              type: 'Sortie', 
              quantity: 1, 
              reference: 'VTE-0001',
              user: 'Admin'
            },
            { 
              id: 3, 
              date: '2023-07-17', 
              product: 'Portefeuille', 
              type: 'Entrée', 
              quantity: 15, 
              reference: 'ACH-0002',
              user: 'Admin'
            },
            { 
              id: 4, 
              date: '2023-07-18', 
              product: 'Portefeuille', 
              type: 'Sortie', 
              quantity: 2, 
              reference: 'VTE-0002',
              user: 'Admin'
            },
            { 
              id: 5, 
              date: '2023-07-20', 
              product: 'Chaussures à talons', 
              type: 'Entrée', 
              quantity: 8, 
              reference: 'ACH-0003',
              user: 'Admin'
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Erreur lors du chargement des mouvements de stock:', err);
        setError('Erreur lors du chargement des mouvements de stock. Veuillez réessayer.');
        setLoading(false);
      }
    };

    fetchMovements();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTypeFilterChange = (event) => {
    setTypeFilter(event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  // Filtrer les mouvements
  const filteredMovements = movements.filter(movement => {
    // Filtre par type
    if (typeFilter !== 'all' && movement.type !== typeFilter) {
      return false;
    }
    
    // Filtre par recherche
    if (searchQuery && !movement.product.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !movement.reference.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mouvements de stock
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Rechercher"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            placeholder="Produit ou référence"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            select
            label="Type"
            value={typeFilter}
            onChange={handleTypeFilterChange}
            fullWidth
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="Entrée">Entrées</MenuItem>
            <MenuItem value="Sortie">Sorties</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Produit</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Quantité</TableCell>
                <TableCell>Référence</TableCell>
                <TableCell>Utilisateur</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMovements
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{formatDate(movement.date)}</TableCell>
                  <TableCell>{movement.product}</TableCell>
                  <TableCell>
                    <Chip 
                      label={movement.type} 
                      color={movement.type === 'Entrée' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{movement.quantity}</TableCell>
                  <TableCell>
                    {movement.type === 'Entrée' ? (
                      <Link to={`/purchases/${movement.reference.split('-')[1]}`}>
                        {movement.reference}
                      </Link>
                    ) : (
                      <Link to={`/sales/${movement.reference.split('-')[1]}`}>
                        {movement.reference}
                      </Link>
                    )}
                  </TableCell>
                  <TableCell>{movement.user}</TableCell>
                </TableRow>
              ))}
              {filteredMovements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Aucun mouvement trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredMovements.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </Paper>
    </Box>
  );
};

export default StockMovementList;