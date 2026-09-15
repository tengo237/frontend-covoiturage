import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ========================================
 * USER CONTEXT - VERSION SIMPLIFIÉE
 * ========================================
 * Sans redirections automatiques pour éviter boucles infinies
 */

// ============================================
// TYPES & INTERFACES
// ============================================

export type UserRole = 'passenger' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo_url?: string;
  roles: UserRole[];
  current_role: UserRole;
  is_admin?: boolean;
  created_at: string;
}

export interface Vehicle {
  id?: string;
  brand: string;
  model: string;
  plate: string;
  color?: string;
  seats?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  becomeDriver: () => Promise<void>;
  registerVehicle: (vehicle: Vehicle) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  clearError: () => void;
  isDriver: boolean;
  isPassenger: boolean;
  isAdmin: boolean;
}

// ============================================
// DONNÉES MOCK LOCALES
// ============================================

const MOCK_USERS: Record<string, { user: User; password: string }> = {
  'test@example.com': {
    password: 'password123',
    user: {
      id: '1',
      name: 'Jean Dupont',
      email: 'test@example.com',
      phone: '+237670123456',
      roles: ['passenger', 'driver'],
      current_role: 'driver',
      is_admin: false,
      created_at: new Date().toISOString(),
    },
  },
  'admin@example.com': {
    password: 'admin123',
    user: {
      id: '2',
      name: 'Admin User',
      email: 'admin@example.com',
      phone: '+237670654321',
      roles: ['passenger'],
      current_role: 'passenger',
      is_admin: true,
      created_at: new Date().toISOString(),
    },
  },
  'passenger@example.com': {
    password: 'password123',
    user: {
      id: '3',
      name: 'Marie Smith',
      email: 'passenger@example.com',
      phone: '+237670999999',
      roles: ['passenger'],
      current_role: 'passenger',
      is_admin: false,
      created_at: new Date().toISOString(),
    },
  },
};

// ============================================
// VALIDATION
// ============================================

const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// ============================================
// CRÉATION DU CONTEXTE
// ============================================

const UserContext = createContext<UserContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // ✅ Charger l'utilisateur au démarrage (UNE SEULE FOIS)
  useEffect(() => {
    if (!initialized) {
      const initializeUser = async () => {
        try {
          const savedUser = await AsyncStorage.getItem('user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        } catch (err) {
          console.error('Erreur lors du chargement du profil:', err);
        } finally {
          setInitialized(true);
        }
      };

      initializeUser();
    }
  }, [initialized]);

  // ============================================
  // LOGIN
  // ============================================

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const { email, password } = credentials;

      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }

      if (!validateEmail(email)) {
        throw new Error('Format email invalide');
      }

      if (!validatePassword(password)) {
        throw new Error('Mot de passe trop court (minimum 6 caractères)');
      }

      const mockUser = MOCK_USERS[email];
      if (!mockUser || mockUser.password !== password) {
        throw new Error('Email ou mot de passe incorrect');
      }

      await AsyncStorage.setItem('user', JSON.stringify(mockUser.user));
      setUser(mockUser.user);
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur de connexion';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SIGNUP
  // ============================================

  const signup = async (data: SignupData) => {
    try {
      setLoading(true);
      setError(null);

      const { name, email, phone, password } = data;

      if (!name || !email || !password) {
        throw new Error('Tous les champs sont requis');
      }

      if (!validateEmail(email)) {
        throw new Error('Format email invalide');
      }

      if (!validatePassword(password)) {
        throw new Error('Mot de passe trop court (minimum 6 caractères)');
      }

      if (MOCK_USERS[email]) {
        throw new Error('Cet email est déjà utilisé');
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone,
        roles: ['passenger'],
        current_role: 'passenger',
        is_admin: false,
        created_at: new Date().toISOString(),
      };

      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // LOGOUT
  // ============================================

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la déconnexion';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // UPDATE PROFILE
  // ============================================

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('Aucun utilisateur connecté');
      }

      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // BECOME DRIVER
  // ============================================

  const becomeDriver = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('Aucun utilisateur connecté');
      }

      const newRoles = user.roles.includes('driver')
        ? user.roles
        : [...user.roles, 'driver'];

      await updateProfile({ roles: newRoles });
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la conversion en conducteur';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // REGISTER VEHICLE
  // ============================================

  const registerVehicle = async (vehicle: Vehicle) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('Aucun utilisateur connecté');
      }

      if (!vehicle.brand || !vehicle.model || !vehicle.plate) {
        throw new Error('Tous les champs sont requis');
      }

      console.log('Véhicule enregistré:', vehicle);

      if (!user.roles.includes('driver')) {
        await becomeDriver();
      }

      const vehicleData = {
        ...vehicle,
        id: Math.random().toString(36).substr(2, 9),
      };
      await AsyncStorage.setItem('vehicle', JSON.stringify(vehicleData));

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de l\'enregistrement du véhicule';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // SWITCH ROLE
  // ============================================

  const switchRole = async (role: UserRole) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('Aucun utilisateur connecté');
      }

      if (!user.roles.includes(role)) {
        throw new Error(`Vous n'avez pas le rôle de ${role}`);
      }

      const updatedUser = { ...user, current_role: role };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du changement de rôle';
      setError(errorMessage);
      throw err;
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
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    becomeDriver,
    registerVehicle,
    switchRole,
    clearError,
    isDriver: user?.roles?.includes('driver') ?? false,
    isPassenger: user?.roles?.includes('passenger') ?? false,
    isAdmin: user?.is_admin ?? false,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// ============================================
// HOOK POUR UTILISER LE CONTEXTE
// ============================================

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser doit être utilisé dans UserProvider');
  }
  return context;
}

export default UserProvider;
