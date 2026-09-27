import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://12.0.0.59:8000';

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

export interface Vehicle {
  id: number;
  user_id: number;
  brand: string;
  model: string;
  color: string;
  plate: string;
  vehicle_photo_url?: string;
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
  vehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: () => Promise<void>;
  loadVehicle: () => Promise<void>;
  updateVehicle: (data: any) => Promise<void>;
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
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
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
      const storedVehicle = await AsyncStorage.getItem('vehicle');

      console.log('💾 Token stocké:', storedToken ? storedToken.slice(0, 30) + '...' : 'NON');
      console.log('💾 User stocké:', storedUser ? 'OUI' : 'NON');
      console.log('💾 Vehicle stocké:', storedVehicle ? 'OUI' : 'NON');

      if (storedToken && storedUser) {
        console.log('✅ Session restaurée');
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        if (storedVehicle) {
          console.log('✅ Véhicule restauré');
          setVehicle(JSON.parse(storedVehicle));
        }
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
  // LOGIN - OPTIMISÉ (RAPIDE!)
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

      console.log('✅ Login complété - Redirection immédiate!');
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
  // SIGNUP - OPTIMISÉ (RAPIDE!)
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

      console.log('✅ Signup complété - Redirection immédiate!');
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
  // UPDATE USER
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
  // LOAD VEHICLE - AVEC TIMEOUT
  // ============================================

  const loadVehicle = async (tokenToUse?: string) => {
    try {
      const tokenForRequest = tokenToUse || token;

      if (!tokenForRequest) {
        console.log('⚠️ Pas de token pour charger le véhicule');
        return;
      }

      console.log('🔵 Chargement du véhicule...');

      // ✅ OPTIMISÉ: Ajouter un timeout de 5 secondes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${API_BASE_URL}/api/vehicles/my-vehicle`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenForRequest}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📩 Status:', response.status);

      if (response.status === 404) {
        console.log('⚠️ Aucun véhicule trouvé');
        setVehicle(null);
        await AsyncStorage.removeItem('vehicle');
        return;
      }

      if (!response.ok) {
        throw new Error('Erreur lors du chargement du véhicule');
      }

      const data = await response.json();
      const vehicleData = data.vehicle;

      if (vehicleData) {
        console.log('🟢 Véhicule trouvé:', vehicleData.brand, vehicleData.model);
        setVehicle(vehicleData);
        await AsyncStorage.setItem('vehicle', JSON.stringify(vehicleData));
        console.log('💾 Véhicule sauvegardé dans AsyncStorage');
      } else {
        console.log('⚠️ Pas de véhicule dans la réponse');
        setVehicle(null);
        await AsyncStorage.removeItem('vehicle');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur';
      console.error('🔴 Erreur loadVehicle:', message);
      setVehicle(null);
      await AsyncStorage.removeItem('vehicle');
    }
  };

  // ============================================
  // UPDATE VEHICLE
  // ============================================

  const updateVehicle = async (vehicleData: any) => {
    try {
      if (!token) {
        console.log('⚠️ Pas de token pour mettre à jour le véhicule');
        return;
      }

      if (!vehicle?.id) {
        console.log('⚠️ Pas de véhicule à mettre à jour');
        return;
      }

      console.log('🔵 Mise à jour du véhicule...');
      console.log('📋 Données:', vehicleData);

      const response = await fetch(
        `${API_BASE_URL}/api/vehicles/${vehicle.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(vehicleData),
        }
      );

      console.log('📩 Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la mise à jour');
      }

      const data = await response.json();
      console.log('🟢 Véhicule mis à jour');

      // Mettre à jour dans le state et AsyncStorage
      setVehicle(data.vehicle);
      await AsyncStorage.setItem('vehicle', JSON.stringify(data.vehicle));

      console.log('💾 Véhicule sauvegardé dans AsyncStorage');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur';
      console.error('🔴 Erreur updateVehicle:', message);
      setError(message);
      throw error;
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
      await AsyncStorage.removeItem('vehicle');

      console.log('✅ Données supprimées');

      setToken(null);
      setUser(null);
      setVehicle(null);
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
    vehicle,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser,
    loadVehicle,
    updateVehicle,
    clearError,
  };

  console.log('📊 UserContext State:', {
    hasUser: !!user,
    hasToken: !!token,
    hasVehicle: !!vehicle,
    loading,
    userEmail: user?.email,
    vehicleInfo: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'none',
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
