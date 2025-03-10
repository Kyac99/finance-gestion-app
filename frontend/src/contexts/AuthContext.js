import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Création du context
const AuthContext = createContext();

// Hook personnalisé pour utiliser le context d'authentification
export const useAuth = () => useContext(AuthContext);

// Fournisseur du context
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuration de l'intercepteur Axios pour ajouter le token à chaque requête
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [token]);

  // Vérification du token au chargement
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Ajouter le token à l'en-tête des requêtes Axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Tenter d'obtenir les informations de l'utilisateur
        const response = await axios.get('/api/token/verify/');
        setUser(response.data);
        setError(null);
      } catch (err) {
        console.error('Token verification error:', err);
        // Si le token est invalide, le supprimer
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setError('Votre session a expiré. Veuillez vous reconnecter.');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Fonction de connexion
  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/token/', { username, password });
      const { access, refresh } = response.data;
      
      // Stocker le token dans le localStorage
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Mettre à jour l'état
      setToken(access);
      
      // Récupérer les informations de l'utilisateur
      const userResponse = await axios.get('/api/token/verify/');
      setUser(userResponse.data);
      setError(null);
      
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Une erreur est survenue lors de la connexion.');
      return { success: false, error: err.response?.data?.detail || 'Une erreur est survenue lors de la connexion.' };
    } finally {
      setLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    // Supprimer le token de l'en-tête des requêtes Axios
    delete axios.defaults.headers.common['Authorization'];
  };

  // Fonction de rafraîchissement du token
  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refreshToken');
      if (!refresh) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post('/api/token/refresh/', { refresh });
      const { access } = response.data;
      
      localStorage.setItem('token', access);
      setToken(access);
      setError(null);
      
      return true;
    } catch (err) {
      console.error('Token refresh error:', err);
      logout();
      setError('Votre session a expiré. Veuillez vous reconnecter.');
      return false;
    }
  };

  // Valeurs exposées par le contexte
  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    refreshToken,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};