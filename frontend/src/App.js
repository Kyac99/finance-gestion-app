import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

// Layouts
import Layout from './components/Layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Fournisseurs
import SupplierList from './pages/Suppliers/SupplierList';
import SupplierDetail from './pages/Suppliers/SupplierDetail';
import SupplierForm from './pages/Suppliers/SupplierForm';

// Produits
import ProductList from './pages/Products/ProductList';
import ProductDetail from './pages/Products/ProductDetail';
import ProductForm from './pages/Products/ProductForm';
import ProductCategoryList from './pages/Products/ProductCategoryList';

// Achats
import PurchaseList from './pages/Purchases/PurchaseList';
import PurchaseDetail from './pages/Purchases/PurchaseDetail';
import PurchaseForm from './pages/Purchases/PurchaseForm';

// Clients
import CustomerList from './pages/Customers/CustomerList';
import CustomerDetail from './pages/Customers/CustomerDetail';
import CustomerForm from './pages/Customers/CustomerForm';

// Ventes
import SaleList from './pages/Sales/SaleList';
import SaleDetail from './pages/Sales/SaleDetail';
import SaleForm from './pages/Sales/SaleForm';

// Factures
import InvoiceList from './pages/Invoices/InvoiceList';
import InvoiceDetail from './pages/Invoices/InvoiceDetail';

// Stock
import StockMovementList from './pages/Stock/StockMovementList';

// Contexts
import { useAuth } from './contexts/AuthContext';

// Route protégée
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        {/* Dashboard */}
        <Route index element={<Dashboard />} />
        
        {/* Fournisseurs */}
        <Route path="suppliers" element={<SupplierList />} />
        <Route path="suppliers/new" element={<SupplierForm />} />
        <Route path="suppliers/:id" element={<SupplierDetail />} />
        <Route path="suppliers/:id/edit" element={<SupplierForm />} />
        
        {/* Produits */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="product-categories" element={<ProductCategoryList />} />
        
        {/* Achats */}
        <Route path="purchases" element={<PurchaseList />} />
        <Route path="purchases/new" element={<PurchaseForm />} />
        <Route path="purchases/:id" element={<PurchaseDetail />} />
        <Route path="purchases/:id/edit" element={<PurchaseForm />} />
        
        {/* Clients */}
        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/new" element={<CustomerForm />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="customers/:id/edit" element={<CustomerForm />} />
        
        {/* Ventes */}
        <Route path="sales" element={<SaleList />} />
        <Route path="sales/new" element={<SaleForm />} />
        <Route path="sales/:id" element={<SaleDetail />} />
        <Route path="sales/:id/edit" element={<SaleForm />} />
        
        {/* Factures */}
        <Route path="invoices" element={<InvoiceList />} />
        <Route path="invoices/:id" element={<InvoiceDetail />} />
        
        {/* Stock */}
        <Route path="stock-movements" element={<StockMovementList />} />
        
        {/* Page non trouvée */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;