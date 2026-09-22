import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://12.0.3.9:8000';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  photo_url?: string;
  roles: string;
  current_role: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

interface UserContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: () => Promise<void>;  // ✅ NOUVEAU
  clearError: () => void;
}

// ============================================
// CRÉATION DU CONTEXTE
// ============================================

const UserContext = createContext<UserContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Charger la session au démarrage (UNE SEULE FOIS)
  useEffect(() => {
    if (!initialized) {
      restoreSession();
      setInitialized(true);
    }
  }, [initialized]);

  const restoreSession = async () => {
    try {
      console.log('🔵 Restauration de la session...');
      setLoading(true);

      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUser = await AsyncStorage.getItem('user');

      console.log('💾 Token stocké:', storedToken ? storedToken.slice(0, 30) + '...' : 'NON');
      console.log('💾 User stocké:', storedUser ? 'OUI' : 'NON');

      if (storedToken && storedUser) {
        console.log('✅ Session restaurée');
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        console.log('⚠️ Pas de session sauvegardée');
      }
    } catch (err) {
      console.error('🔴 Erreur restauration:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOGIN - VRAI BACKEND
  // ============================================

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const { email, password } = credentials;

      console.log('🔵 Login attempt for:', email);
      console.log('🌐 Backend URL:', API_BASE_URL);

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📩 Réponse status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Email ou mot de passe incorrect');
      }

      const data = await response.json();
      console.log('🟢 Login success:', data.user.email);
      console.log('🔐 Token reçu:', data.token.slice(0, 30) + '...');

      // Sauvegarder token ET user
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      console.log('💾 Token et user sauvegardés');

      // Mettre à jour l'état
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur de connexion';
      console.error('🔴 Login error:', message);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SIGNUP - VRAI BACKEND
  // ============================================

  const signup = async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔵 Signup attempt for:', data.email);

      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📩 Réponse status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'inscription');
      }

      const result = await response.json();
      console.log('🟢 Signup success');
      console.log('🔐 Token reçu:', result.token.slice(0, 30) + '...');

      // Sauvegarder token ET user
      await AsyncStorage.setItem('userToken', result.token);
      await AsyncStorage.setItem('user', JSON.stringify(result.user));

      console.log('💾 Token et user sauvegardés');

      // Mettre à jour l'état
      setToken(result.token);
      setUser(result.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur';
      console.error('🔴 Signup error:', message);
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // UPDATE USER - ✅ NOUVEAU
  // ============================================

  const updateUser = async () => {
    try {
      if (!token) {
        console.log('⚠️ Pas de token disponible');
        return;
      }

      console.log('🔵 Rafraîchissement des données utilisateur...');

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📩 Status:', response.status);

      if (!response.ok) {
        throw new Error('Erreur lors du rafraîchissement');
      }

      const data = await response.json();
      console.log('🟢 Données utilisateur mises à jour');

      // Mettre à jour l'état et AsyncStorage
      setUser(data.user);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));

      console.log('💾 User mis à jour dans AsyncStorage');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur';
      console.error('🔴 Erreur updateUser:', message);
      setError(message);
    }
  };

  // ============================================
  // LOGOUT
  // ============================================

  const logout = async () => {
    try {
      setLoading(true);
      console.log('🔴 Logout...');

      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');

      console.log('✅ Données supprimées');

      setToken(null);
      setUser(null);
    } catch (err) {
      console.error('🔴 Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CLEAR ERROR
  // ============================================

  const clearError = () => {
    setError(null);
  };

  // ============================================
  // RETURN PROVIDER
  // ============================================

  const value: UserContextType = {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser,  // ✅ NOUVEAU
    clearError,
  };

  console.log('📊 UserContext State:', {
    hasUser: !!user,
    hasToken: !!token,
    loading,
    userEmail: user?.email,
  });

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// ============================================
// HOOK POUR UTILISER LE CONTEXTE
// ============================================

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

export default UserProvider;