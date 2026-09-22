import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';
import * as ImagePicker from 'expo-image-picker';

const API_BASE_URL = 'http://12.0.3.9:8000';

const getImageUrl = (url: string | null) => {
  if (!url) return 'https://via.placeholder.com/100?text=User';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

export default function EditProfile() {
  const router = useRouter();
  const { user, token, updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        console.log('[PHOTO] Selection: OK');
        setSelectedPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('[PHOTO] Erreur selection:', error);
      Alert.alert('Erreur', 'Impossible de selectionner une photo');
    }
  };

  // SOLUTION 1: Envoyer TOUT en FormData en une seule requête
  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      console.log('\n========== DEBUT MISE A JOUR PROFIL ==========\n');
      console.log('[MAIN] Collecte des donnees');
      console.log('[MAIN] - Nom:', formData.name);
      console.log('[MAIN] - Email:', formData.email);
      console.log('[MAIN] - Telephone:', formData.phone);
      console.log('[MAIN] - Photo:', selectedPhoto ? 'OUI' : 'NON');

      // CRÉER LE FORMDATA AVEC TOUS LES CHAMPS
      const formDataObj = new FormData();

      // Ajouter les données texte en FormData
      formDataObj.append('name', formData.name);
      formDataObj.append('email', formData.email);
      formDataObj.append('phone', formData.phone);

      // Ajouter la photo si présente
      if (selectedPhoto) {
        console.log('[MAIN] Ajout de la photo au FormData');
        const photoFile = {
          uri: selectedPhoto.uri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        };
        formDataObj.append('photo', photoFile as any);
        console.log('[MAIN] Photo ajoutee au FormData');
      }

      console.log('[MAIN] Envoi de la requête FormData');

      const url = `${API_BASE_URL}/api/auth/profile`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // NE PAS ajouter Content-Type - le fetch le fera automatiquement
        },
        body: formDataObj,
      });

      console.log('[MAIN] Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MAIN] Erreur reponse:', errorText);
        throw new Error(errorText || 'Erreur mise a jour');
      }

      const data = await response.json();
      console.log('[MAIN] OK - Reponse:', data.status);

      // Mettre à jour le contexte utilisateur
      if (updateUser) {
        console.log('[MAIN] Refresh contexte utilisateur');
        await updateUser();
        console.log('[MAIN] OK - Contexte mis a jour');
      }

      // Afficher succès
      Alert.alert(
        'Succes!',
        'Votre profil a ete mis a jour avec succes.',
        [
          {
            text: 'Continuer',
            onPress: () => {
              setSelectedPhoto(null);
              router.back();
            },
          },
        ]
      );

      console.log('\n========== OK - MISE A JOUR COMPLETEE ==========\n');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('\n[MAIN] ERREUR:', message);
      console.error('[MAIN] Details:', error);

      Alert.alert('Erreur', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="chevron-back" size={28} color="#1f2937" />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937' }}>
            Modifier le Profil
          </Text>
        </View>

        {/* Avatar Section */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity
            onPress={pickImage}
            disabled={loading}
            style={{
              position: 'relative',
              marginBottom: 12,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Image
              source={{
                uri: selectedPhoto?.uri || getImageUrl(user?.photo_url),
              }}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
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
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#D85A30',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: '#fff',
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="camera" size={18} color="#fff" />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={pickImage} disabled={loading}>
            <Text
              style={{
                fontSize: 12,
                color: '#D85A30',
                fontWeight: '600',
                textDecorationLine: 'underline',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {selectedPhoto ? 'Changer la photo' : 'Ajouter une photo'}
            </Text>
          </TouchableOpacity>

          {selectedPhoto && (
            <Text style={{ fontSize: 11, color: '#10b981', fontWeight: '500', marginTop: 6 }}>
              Photo selectionnee
            </Text>
          )}
        </View>

        {/* Form Fields */}
        <View style={{ marginBottom: 24 }}>
          {/* Nom */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 6 }}>
              Nom complet
            </Text>
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E8D5C4',
                paddingHorizontal: 12,
              }}
            >
              <Ionicons name="person" size={18} color="#D85A30" />
              <TextInput
                style={{
                  flex: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: '#1f2937',
                }}
                placeholder="Votre nom"
                placeholderTextColor="#9ca3af"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                editable={!loading}
              />
            </View>
          </View>

          {/* Email */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 6 }}>
              Email
            </Text>
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E8D5C4',
                paddingHorizontal: 12,
              }}
            >
              <Ionicons name="mail" size={18} color="#D85A30" />
              <TextInput
                style={{
                  flex: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: '#1f2937',
                }}
                placeholder="Votre email"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                editable={!loading}
              />
            </View>
          </View>

          {/* Telephone */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 6 }}>
              Telephone
            </Text>
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E8D5C4',
                paddingHorizontal: 12,
              }}
            >
              <Ionicons name="call" size={18} color="#D85A30" />
              <TextInput
                style={{
                  flex: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 14,
                  color: '#1f2937',
                }}
                placeholder="Votre telephone"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                editable={!loading}
              />
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View
          style={{
            backgroundColor: '#FEE8E0',
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 12,
            marginBottom: 24,
            flexDirection: 'row',
          }}
        >
          <Ionicons
            name="information-circle"
            size={18}
            color="#D85A30"
            style={{ marginRight: 8, marginTop: 2 }}
          />
          <Text
            style={{
              fontSize: 12,
              color: '#D85A30',
              fontWeight: '500',
              flex: 1,
            }}
          >
            {selectedPhoto
              ? 'Votre photo sera uploadee avec vos donnees.'
              : 'Tous les champs seront envoyes ensemble.'}
          </Text>
        </View>

        {/* Progress Indicator */}
        {loading && (
          <View
            style={{
              backgroundColor: '#e0f2fe',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 12,
              marginBottom: 24,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="small" color="#378ADD" style={{ marginRight: 8 }} />
            <Text
              style={{
                fontSize: 12,
                color: '#378ADD',
                fontWeight: '600',
                flex: 1,
              }}
            >
              Mise a jour en cours...
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#d1d5db' : '#D85A30',
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: 'center',
            marginBottom: 16,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
              Enregistrer les modifications
            </Text>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          disabled={loading}
          style={{
            backgroundColor: '#f0f0f0',
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: 'center',
            opacity: loading ? 0.5 : 1,
          }}
        >
          <Text style={{ color: '#1f2937', fontWeight: '600', fontSize: 14 }}>
            Annuler
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}