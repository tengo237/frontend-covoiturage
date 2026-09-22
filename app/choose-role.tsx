import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://12.0.3.9:8000';

export default function ChooseRole() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        setUserData(JSON.parse(data));
      }
    } catch (error) {
      console.error('Erreur chargement user data:', error);
    }
  };

  const handleRoleSelect = async (role: 'driver' | 'passenger') => {
    try {
      setLoading(true);
      console.log(`[CHOOSE-ROLE] Sélection rôle: ${role}`);

      // Mettre à jour le rôle dans AsyncStorage
      if (userData) {
        const updatedUser = {
          ...userData,
          current_role: role,
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        console.log(`[CHOOSE-ROLE] Rôle mis à jour en AsyncStorage: ${role}`);
      }

      console.log(`[CHOOSE-ROLE] Redirection vers ${role}...`);

      // Rediriger vers le bon dashboard
      if (role === 'driver') {
        router.replace('/(driver)/(tabs)/mes-trajets');
      } else {
        router.replace('/(tabs)/index');
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le rôle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Bienvenue! 👋</Text>
          <Text style={styles.subtitle}>{userData?.name || 'Utilisateur'}</Text>
          <Text style={styles.email}>{userData?.email}</Text>
        </View>

        {/* Titre */}
        <Text style={styles.sectionTitle}>Sélectionnez votre rôle</Text>

        {/* Card Passager */}
        <TouchableOpacity
          onPress={() => handleRoleSelect('passenger')}
          disabled={loading}
          style={[styles.card, loading && styles.cardDisabled]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="person" size={40} color="#378ADD" />
          </View>

          <Text style={styles.cardTitle}>Je suis Passager</Text>

          <Text style={styles.cardDescription}>
            Chercher et réserver des trajets
          </Text>

          <View style={styles.buttonPrimary}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
                <Text style={styles.buttonText}>Continuer</Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Card Conducteur */}
        <TouchableOpacity
          onPress={() => handleRoleSelect('driver')}
          disabled={loading}
          style={[styles.card, loading && styles.cardDisabled]}
        >
          <View style={[styles.iconContainer, styles.iconContainerOrange]}>
            <Ionicons name="car" size={40} color="#D85A30" />
          </View>

          <Text style={styles.cardTitle}>Je suis Conducteur</Text>

          <Text style={styles.cardDescription}>
            Créer et gérer vos trajets
          </Text>

          <View style={styles.buttonSecondary}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
                <Text style={styles.buttonText}>Continuer</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF6EF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#E8D5C4',
  },
  cardDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  iconContainerOrange: {
    backgroundColor: '#FFF5E6',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonPrimary: {
    backgroundColor: '#378ADD',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#D85A30',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
  },
});
