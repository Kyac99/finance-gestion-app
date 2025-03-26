import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
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

const SaleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const customerId = queryParams.get('customer');
  
  const isEditMode = !!id;
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    customer_id: customerId || '',
    date: new Date(),
    status: 'En préparation',
    payment_status: 'Non payé',
    payment_method: 'Carte bancaire',
    items: [],
    shipping: 15,
    discount: 0,
    notes: ''
  });
  
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPrice, setSelectedPrice] = useState('');
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Chargement des clients et produits
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Simulation des données
        setCustomers([
          { id: 1, name: 'Marie Dupont' },
          { id: 2, name: 'Jean Martin' },
          { id: 3, name: 'Sophie Bernard' }
        ]);
      } catch (err) {
        console.error('Erreur lors du chargement des clients:', err);
      }
    };

    const fetchProducts = async () => {
      try {
        // Simulation des données
        setProducts([
          { id: 1, name: 'Sac à main en cuir', price: 149.99 },
          { id: 2, name: 'Portefeuille', price: 49.99 },
          { id: 3, name: 'Chaussures à talons', price: 89.99 },
          { id: 4, name: 'Bracelet', price: 29.99 }
        ]);
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
      }
    };

    fetchCustomers();
    fetchProducts();

    // Si en mode édition, charger les données de la vente
    if (isEditMode) {
      const fetchSale = async () => {
        try {
          // Simulation des données
          setTimeout(() => {
            setFormData({
              customer_id: 1,
              date: new Date('2023-07-15'),
              status: 'En préparation',
              payment_status: 'Non payé',
              payment_method: 'Carte bancaire',
              items: [
                { id: 1, product_id: 1, product_name: 'Sac à main en cuir', quantity: 1, unit_price: 149.99, total: 149.99 },
                { id: 2, product_id: 2, product_name: 'Portefeuille', quantity: 2, unit_price: 49.99, total: 99.98 },
                { id: 3, product_id: 3, product_name: 'Chaussures à talons', quantity: 1, unit_price: 89.99, total: 89.99 }
              ],
              shipping: 15,
              discount: 0,
              notes: ''
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
    }
  }, [id, isEditMode, customerId]);

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

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date
    });
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    
    // Pré-remplir le prix avec le prix de vente du produit sélectionné
    const selectedProductObj = products.find(p => p.id === productId);
    if (selectedProductObj) {
      setSelectedPrice(selectedProductObj.price.toString());
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
    const discount = parseFloat(formData.discount) || 0;
    const shipping = parseFloat(formData.shipping) || 0;
    const tax = subtotal * 0.2; // TVA 20%
    const total = subtotal + tax + shipping - discount;
    
    return {
      subtotal,
      tax,
      shipping,
      discount,
      total
    };
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.customer_id) {
      errors.customer_id = 'Le client est requis';
    }
    
    if (!formData.date) {
      errors.date = 'La date est requise';
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
        navigate(`/sales/${id}`, { state: { alertMessage: 'Vente mise à jour avec succès.', alertSeverity: 'success' } });
      } else {
        // Simulons la création pour le développement
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/sales', { state: { alertMessage: 'Vente créée avec succès.', alertSeverity: 'success' } });
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la vente:', err);
      setError('Erreur lors de la sauvegarde de la vente. Veuillez réessayer.');
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
          to="/sales"
          sx={{ mr: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Retour
        </Button>
        <Typography variant="h4" component="h1">
          {isEditMode ? 'Modifier la vente' : 'Nouvelle vente'}
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
              <FormControl fullWidth error={!!validationErrors.customer_id}>
                <InputLabel id="customer-label">Client *</InputLabel>
                <Select
                  labelId="customer-label"
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleInputChange}
                  label="Client *"
                >
                  {customers.map(customer => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
                {validationErrors.customer_id && (
                  <Typography variant="caption" color="error">
                    {validationErrors.customer_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                <DatePicker
                  label="Date de vente *"
                  value={formData.date}
                  onChange={handleDateChange}
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
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Statut</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label="Statut"
                >
                  <MenuItem value="En préparation">En préparation</MenuItem>
                  <MenuItem value="En cours de livraison">En cours de livraison</MenuItem>
                  <MenuItem value="Livré">Livré</MenuItem>
                  <MenuItem value="Annulé">Annulé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
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
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="payment-method-label">Méthode de paiement</InputLabel>
                <Select
                  labelId="payment-method-label"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleInputChange}
                  label="Méthode de paiement"
                >
                  <MenuItem value="Carte bancaire">Carte bancaire</MenuItem>
                  <MenuItem value="Espèces">Espèces</MenuItem>
                  <MenuItem value="Virement">Virement</MenuItem>
                  <MenuItem value="Chèque">Chèque</MenuItem>
                </Select>
              </FormControl>
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
                  </TableBody>
                </Table>
              </TableContainer>
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
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="discount"
                label="Remise (€)"
                value={formData.discount}
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
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="h6">Total: {totals.total.toFixed(2)} €</Typography>
              </Box>
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
                to="/sales"
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

export default SaleForm;