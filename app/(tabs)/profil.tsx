import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../../context/UserContext';

const API_BASE_URL = 'http://12.0.3.9:8000';

const getImageUrl = (url: string | null) => {
  if (!url) return 'https://via.placeholder.com/80?text=User';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const MENU_ITEMS = [
  { icon: 'settings-outline', label: 'Paramètres', route: '/settings' },
  { icon: 'credit-card-outline', label: 'Mode de paiement', route: '/payment-settings' },
  { icon: 'document-text-outline', label: 'Conditions d\'utilisation', route: '/terms' },
  { icon: 'shield-checkmark-outline', label: 'Confidentialité', route: '/privacy' },
  { icon: 'help-circle-outline', label: 'Aide & Support', route: '/support' },
];

export default function Profil() {
  const router = useRouter();
  const { user, token, logout } = useUser();
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    console.log('👤 Profil Page - User:', user?.email);
  }, [user]);

  const handleLogout = async () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnecter',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/login');
          } catch (error) {
            Alert.alert('❌ Erreur', 'Impossible de se déconnecter');
          }
        },
      },
    ]);
  };

  // ✅ CORRIGER: Redirection vers /edit-profile
  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  // ✅ CORRIGER: Redirection vers /add-vehicle
  const handleBecomeDriver = () => {
    router.push('/add-vehicle');
  };

  const isDriver = user?.roles?.includes('driver');

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, color: '#9ca3af', marginBottom: 16 }}>
            Vous n'êtes pas connecté
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/login')}
            style={{
              backgroundColor: '#D85A30',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ========== HEADER PROFIL ========== */}
        <View style={{ alignItems: 'center', paddingVertical: 24, paddingHorizontal: 16 }}>
          {/* Avatar */}
          <TouchableOpacity
            onPress={handleEditProfile}
            style={{ position: 'relative', marginBottom: 16 }}
          >
            <Image
              source={{ uri: getImageUrl(user.photo_url) }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: '#f0f0f0',
                borderWidth: 3,
                borderColor: '#D85A30',
              }}
            />
            {/* Edit Badge */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#D85A30',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#fff',
              }}
            >
              <Ionicons name="pencil" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Nom & Email */}
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937', marginBottom: 4 }}>
            {user.name}
          </Text>
          <Text style={{ fontSize: 14, color: '#9ca3af', marginBottom: 12 }}>
            {user.email}
          </Text>

          {/* Edit Profile Link */}
          <TouchableOpacity onPress={handleEditProfile}>
            <Text
              style={{
                fontSize: 12,
                color: '#D85A30',
                fontWeight: '600',
                textDecorationLine: 'underline',
              }}
            >
              Modifier le profil
            </Text>
          </TouchableOpacity>

          {/* Role Badge */}
          <View
            style={{
              marginTop: 16,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: '#FEE8E0',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#FECCC1',
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#D85A30',
              }}
            >
              {isDriver ? '🚗 Conducteur & Passager' : '👤 Passager'}
            </Text>
          </View>
        </View>

        {/* ========== STATS ========== */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#fff',
                paddingVertical: 16,
                paddingHorizontal: 12,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E8D5C4',
              }}
            >
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, fontWeight: '500' }}>
                Évaluations
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginTop: 4 }}>
                4.8 ⭐
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: '#fff',
                paddingVertical: 16,
                paddingHorizontal: 12,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E8D5C4',
              }}
            >
              <Ionicons name="car" size={24} color="#3b82f6" />
              <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, fontWeight: '500' }}>
                Trajets
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginTop: 4 }}>
                12
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: '#fff',
                paddingVertical: 16,
                paddingHorizontal: 12,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E8D5C4',
              }}
            >
              <Ionicons name="heart" size={24} color="#ef4444" />
              <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 8, fontWeight: '500' }}>
                Sauvegardés
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginTop: 4 }}>
                3
              </Text>
            </View>
          </View>
        </View>

        {/* ========== BOUTONS DE RÔLE ========== */}
        {!isDriver && (
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={handleBecomeDriver}
              style={{
                backgroundColor: '#D85A30',
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#C9481E',
              }}
            >
              <Ionicons name="car-sport" size={18} color="#fff" />
              <Text
                style={{
                  color: '#fff',
                  fontWeight: '700',
                  marginLeft: 8,
                  fontSize: 14,
                }}
              >
                 Devenir Conducteur
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isDriver && (
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={() => {
                Alert.alert('ℹ️', 'Espace conducteur bientôt disponible');
              }}
              style={{
                backgroundColor: '#378ADD',
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#185FA5',
              }}
            >
              <Ionicons name="car" size={18} color="#fff" />
              <Text
                style={{
                  color: '#fff',
                  fontWeight: '700',
                  marginLeft: 8,
                  fontSize: 14,
                }}
              >
                Espace Conducteur
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========== MENU ========== */}
        <View
          style={{
            marginHorizontal: 16,
            backgroundColor: '#fff',
            borderRadius: 12,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: '#E8D5C4',
            marginBottom: 24,
          }}
        >
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              // ✅ CORRIGER: Vérifier si la route existe avant de rediriger
              onPress={() => {
                if (item.route === '/settings') {
                  router.push('/settings');
                } else if (item.route === '/payment-settings') {
                  router.push('/payment-settings');
                } else if (item.route === '/terms') {
                  Alert.alert('📄 Conditions d\'utilisation', 'Fonctionnalité bientôt disponible');
                } else if (item.route === '/privacy') {
                  Alert.alert('🔒 Confidentialité', 'Fonctionnalité bientôt disponible');
                } else if (item.route === '/support') {
                  Alert.alert('💬 Aide & Support', 'Fonctionnalité bientôt disponible');
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: index < MENU_ITEMS.length - 1 ? 1 : 0,
                borderBottomColor: '#f0f0f0',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name={item.icon as any} size={18} color="#D85A30" />
                <Text
                  style={{
                    fontSize: 14,
                    color: '#1f2937',
                    fontWeight: '500',
                    marginLeft: 12,
                  }}
                >
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ========== LOGOUT BUTTON ========== */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: '#FEE8E0',
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 10,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#FECCC1',
            }}
          >
            <Text style={{ color: '#D85A30', fontWeight: '600', fontSize: 14 }}>
              Se déconnecter
            </Text>
          </TouchableOpacity>
        </View>

       
      </ScrollView>
    </SafeAreaView>
  );
}