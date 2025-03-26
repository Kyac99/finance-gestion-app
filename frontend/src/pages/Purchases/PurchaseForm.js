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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import frLocale from 'date-fns/locale/fr';
import axios from 'axios';

const PurchaseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    supplier_id: '',
    date: new Date(),
    expected_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours plus tard
    status: 'En attente',
    payment_status: 'Non payé',
    items: [],
    shipping: 0,
    notes: ''
  });
  
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPrice, setSelectedPrice] = useState('');
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Chargement des fournisseurs et produits
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        // Simulation des données
        setSuppliers([
          { id: 1, name: 'Fournisseur A' },
          { id: 2, name: 'Fournisseur B' },
          { id: 3, name: 'Fournisseur C' }
        ]);
      } catch (err) {
        console.error('Erreur lors du chargement des fournisseurs:', err);
      }
    };

    const fetchProducts = async () => {
      try {
        // Simulation des données
        setProducts([
          { id: 1, name: 'Sac à main en cuir', cost: 80.00 },
          { id: 2, name: 'Portefeuille', cost: 30.00 },
          { id: 3, name: 'Chaussures à talons', cost: 60.00 },
          { id: 4, name: 'Bracelet', cost: 15.00 }
        ]);
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
      }
    };

    fetchSuppliers();
    fetchProducts();

    // Si en mode édition, charger les données de l'achat
    if (isEditMode) {
      const fetchPurchase = async () => {
        try {
          // Simulation des données
          setTimeout(() => {
            setFormData({
              supplier_id: 1,
              date: new Date('2023-05-15'),
              expected_delivery: new Date('2023-05-20'),
              status: 'En attente',
              payment_status: 'Non payé',
              items: [
                { id: 1, product_id: 1, product_name: 'Sac à main en cuir', quantity: 5, unit_price: 80.00, total: 400.00 },
                { id: 2, product_id: 2, product_name: 'Portefeuille', quantity: 10, unit_price: 30.00, total: 300.00 },
                { id: 3, product_id: 3, product_name: 'Chaussures à talons', quantity: 8, unit_price: 60.00, total: 480.00 }
              ],
              shipping: 45,
              notes: 'Commande importante pour la saison estivale.'
            });
            setLoading(false);
          }, 1000);
        } catch (err) {
          console.error('Erreur lors du chargement de l\'achat:', err);
          setError('Erreur lors du chargement de l\'achat. Veuillez réessayer.');
          setLoading(false);
        }
      };

      fetchPurchase();
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

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    
    // Pré-remplir le prix avec le coût du produit sélectionné
    const selectedProductObj = products.find(p => p.id === productId);
    if (selectedProductObj) {
      setSelectedPrice(selectedProductObj.cost.toString());
    } else {
      setSelectedPrice('');
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct || selectedQuantity <= 0 || !selectedPrice) {
      return;
    }
    
    const productObj = products.find(p => p.id === selectedProduct);
    if (!productObj) return;
    
    const unitPrice = parseFloat(selectedPrice);
    const quantity = parseInt(selectedQuantity);
    const total = unitPrice * quantity;
    
    const newItem = {
      id: Date.now(), // ID temporaire
      product_id: selectedProduct,
      product_name: productObj.name,
      quantity,
      unit_price: unitPrice,
      total
    };
    
    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
    
    // Réinitialiser les champs
    setSelectedProduct('');
    setSelectedQuantity(1);
    setSelectedPrice('');
  };

  const handleRemoveItem = (itemId) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== itemId)
    });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const shipping = parseFloat(formData.shipping) || 0;
    const tax = subtotal * 0.2; // TVA 20%
    const total = subtotal + tax + shipping;
    
    return {
      subtotal,
      tax,
      shipping,
      total
    };
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.supplier_id) {
      errors.supplier_id = 'Le fournisseur est requis';
    }
    
    if (!formData.date) {
      errors.date = 'La date est requise';
    }
    
    if (!formData.expected_delivery) {
      errors.expected_delivery = 'La date de livraison prévue est requise';
    }
    
    if (formData.items.length === 0) {
      errors.items = 'Au moins un article est requis';
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
      // Calcul des totaux pour l'envoi
      const totals = calculateTotals();
      const dataToSubmit = {
        ...formData,
        ...totals
      };
      
      if (isEditMode) {
        // Simulons la mise à jour pour le développement
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate(`/purchases/${id}`, { state: { alertMessage: 'Achat mis à jour avec succès.', alertSeverity: 'success' } });
      } else {
        // Simulons la création pour le développement
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/purchases', { state: { alertMessage: 'Achat créé avec succès.', alertSeverity: 'success' } });
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de l\'achat:', err);
      setError('Erreur lors de la sauvegarde de l\'achat. Veuillez réessayer.');
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

  const totals = calculateTotals();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          component={Link}
          to="/purchases"
          sx={{ mr: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Retour
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Modifier l\'achat' : 'Nouvel achat'}
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
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!validationErrors.supplier_id}>
                <InputLabel id="supplier-label">Fournisseur *</InputLabel>
                <Select
                  labelId="supplier-label"
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleInputChange}
                  label="Fournisseur *"
                >
                  {suppliers.map(supplier => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.supplier_id && (
                  <Typography variant="caption" color="error">
                    {validationErrors.supplier_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!validationErrors.status}>
                <InputLabel id="status-label">Statut</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Statut"
                >
                  <MenuItem value="En attente">En attente</MenuItem>
                  <MenuItem value="Livré">Livré</MenuItem>
                  <MenuItem value="Annulé">Annulé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                <DatePicker
                  label="Date d'achat *"
                  value={formData.date}
                  onChange={(date) => handleDateChange('date', date)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!validationErrors.date}
                      helperText={validationErrors.date}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                <DatePicker
                  label="Date de livraison prévue *"
                  value={formData.expected_delivery}
                  onChange={(date) => handleDateChange('expected_delivery', date)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!validationErrors.expected_delivery}
                      helperText={validationErrors.expected_delivery}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="payment-status-label">Statut de paiement</InputLabel>
                <Select
                  labelId="payment-status-label"
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleInputChange}
                  label="Statut de paiement"
                >
                  <MenuItem value="Non payé">Non payé</MenuItem>
                  <MenuItem value="Partiel">Partiellement payé</MenuItem>
                  <MenuItem value="Payé">Payé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="shipping"
                label="Frais de livraison (€)"
                value={formData.shipping}
                onChange={handleInputChange}
                fullWidth
                type="number"
                inputProps={{ step: '0.01', min: '0' }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">€</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" gutterBottom>Articles</Typography>
              
              {validationErrors.items && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {validationErrors.items}
                </Alert>
              )}
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="product-label">Produit</InputLabel>
                    <Select
                      labelId="product-label"
                      value={selectedProduct}
                      onChange={handleProductChange}
                      label="Produit"
                    >
                      {products.map(product => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Quantité"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    fullWidth
                    type="number"
                    inputProps={{ min: '1' }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Prix unitaire (€)"
                    value={selectedPrice}
                    onChange={(e) => setSelectedPrice(e.target.value)}
                    fullWidth
                    type="number"
                    inputProps={{ step: '0.01', min: '0' }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">€</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={2} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddItem}
                    fullWidth
                    startIcon={<AddIcon />}
                  >
                    Ajouter
                  </Button>
                </Grid>
              </Grid>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Produit</TableCell>
                      <TableCell align="right">Quantité</TableCell>
                      <TableCell align="right">Prix unitaire</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formData.items.length > 0 ? (
                      formData.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">{item.unit_price.toFixed(2)} €</TableCell>
                          <TableCell align="right">{item.total.toFixed(2)} €</TableCell>
                          <TableCell align="center">
                            <IconButton onClick={() => handleRemoveItem(item.id)} color="error">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">Aucun article ajouté</TableCell>
                      </TableRow>
                    )}
                    
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell align="right"><strong>Sous-total</strong></TableCell>
                      <TableCell align="right">{totals.subtotal.toFixed(2)} €</TableCell>
                      <TableCell />
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell align="right">TVA (20%)</TableCell>
                      <TableCell align="right">{totals.tax.toFixed(2)} €</TableCell>
                      <TableCell />
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell align="right">Livraison</TableCell>
                      <TableCell align="right">{totals.shipping.toFixed(2)} €</TableCell>
                      <TableCell />
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={2} />
                      <TableCell align="right"><Typography variant="h6">Total</Typography></TableCell>
                      <TableCell align="right"><Typography variant="h6">{totals.total.toFixed(2)} €</Typography></TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
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
                to="/purchases"
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

export default PurchaseForm;