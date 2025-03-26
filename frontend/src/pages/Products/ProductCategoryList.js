import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';

const ProductCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  const [currentCategory, setCurrentCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Simulons les données pour le développement
        setTimeout(() => {
          setCategories([
            { id: 1, name: 'Sacs', count: 15 },
            { id: 2, name: 'Chaussures', count: 8 },
            { id: 3, name: 'Accessoires', count: 12 },
            { id: 4, name: 'Vêtements', count: 5 }
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Erreur lors du chargement des catégories:', err);
        setError('Erreur lors du chargement des catégories. Veuillez réessayer.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleAddOpen = () => {
    setNewCategoryName('');
    setOpenAddDialog(true);
  };

  const handleAddClose = () => {
    setOpenAddDialog(false);
  };

  const handleEditOpen = (category) => {
    setCurrentCategory(category);
    setEditCategoryName(category.name);
    setOpenEditDialog(true);
  };

  const handleEditClose = () => {
    setOpenEditDialog(false);
  };

  const handleDeleteOpen = (category) => {
    setCurrentCategory(category);
    setOpenDeleteDialog(true);
  };

  const handleDeleteClose = () => {
    setOpenDeleteDialog(false);
  };

  const handleAddCategory = () => {
    // Vérifier que le nom n'est pas vide
    if (!newCategoryName.trim()) {
      return;
    }
    
    // Simulons l'ajout pour le développement
    const newId = Math.max(...categories.map(c => c.id), 0) + 1;
    const newCategory = { id: newId, name: newCategoryName, count: 0 };
    
    setCategories([...categories, newCategory]);
    setOpenAddDialog(false);
  };

  const handleEditCategory = () => {
    // Vérifier que le nom n'est pas vide
    if (!editCategoryName.trim() || !currentCategory) {
      return;
    }
    
    // Simulons la mise à jour pour le développement
    const updatedCategories = categories.map(category => 
      category.id === currentCategory.id 
        ? { ...category, name: editCategoryName }
        : category
    );
    
    setCategories(updatedCategories);
    setOpenEditDialog(false);
  };

  const handleDeleteCategory = () => {
    if (!currentCategory) {
      return;
    }
    
    // Vérifier si la catégorie contient des produits
    if (currentCategory.count > 0) {
      setError(`Impossible de supprimer la catégorie "${currentCategory.name}" car elle contient des produits.`);
      setOpenDeleteDialog(false);
      return;
    }
    
    // Simulons la suppression pour le développement
    const filteredCategories = categories.filter(category => category.id !== currentCategory.id);
    setCategories(filteredCategories);
    setOpenDeleteDialog(false);
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
          to="/products"
          sx={{ mr: 2 }}
          startIcon={<ArrowBackIcon />}
        >
          Retour aux produits
        </Button>
        <Typography variant="h4" component="h1">
          Catégories de produits
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Liste des catégories</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddOpen}
          >
            Ajouter
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <List>
          {categories.map(category => (
            <ListItem
              key={category.id}
              secondaryAction={
                <Box>
                  <IconButton
                    edge="end"
                    aria-label="modifier"
                    onClick={() => handleEditOpen(category)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="supprimer"
                    onClick={() => handleDeleteOpen(category)}
                    disabled={category.count > 0}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={category.name}
                secondary={`${category.count} produit${category.count !== 1 ? 's' : ''}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Dialogue d'ajout de catégorie */}
      <Dialog open={openAddDialog} onClose={handleAddClose}>
        <DialogTitle>Ajouter une catégorie</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de la catégorie"
            type="text"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>Annuler</Button>
          <Button onClick={handleAddCategory} variant="contained" color="primary">
            Ajouter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de modification de catégorie */}
      <Dialog open={openEditDialog} onClose={handleEditClose}>
        <DialogTitle>Modifier la catégorie</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nom de la catégorie"
            type="text"
            fullWidth
            value={editCategoryName}
            onChange={(e) => setEditCategoryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Annuler</Button>
          <Button onClick={handleEditCategory} variant="contained" color="primary">
            Modifier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogue de suppression de catégorie */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteClose}>
        <DialogTitle>Supprimer la catégorie</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer la catégorie "{currentCategory?.name}" ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Annuler</Button>
          <Button onClick={handleDeleteCategory} color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductCategoryList;