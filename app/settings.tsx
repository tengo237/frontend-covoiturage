import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SETTINGS_GROUPS = [
  {
    title: 'Notifications',
    items: [
      { label: 'Messages', key: 'messages_notif', icon: 'notifications' },
      { label: 'Trajets', key: 'trips_notif', icon: 'car' },
      { label: 'Promotions', key: 'promo_notif', icon: 'gift' },
    ],
  },
  {
    title: 'Confidentialité',
    items: [
      { label: 'Profil public', key: 'profile_public', icon: 'globe' },
      { label: 'Partage de localisation', key: 'share_location', icon: 'location' },
      { label: 'Historique de trajets', key: 'trip_history', icon: 'time' },
    ],
  },
  {
    title: 'Préférences',
    items: [
      { label: 'Langue', key: 'language', icon: 'language' },
      { label: 'Thème sombre', key: 'dark_mode', icon: 'moon' },
      { label: 'Données mobiles', key: 'mobile_data', icon: 'wifi' },
    ],
  },
];

export default function Settings() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    messages_notif: true,
    trips_notif: true,
    promo_notif: false,
    profile_public: true,
    share_location: true,
    trip_history: true,
    language: false,
    dark_mode: false,
    mobile_data: true,
  });

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleClearData = () => {
    Alert.alert(
      'Effacer les données',
      'Cela supprimera vos données locales. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: () => {
            Alert.alert('✅', 'Données effacées avec succès');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <Ionicons name="chevron-back" size={28} color="#1f2937" />
            </TouchableOpacity>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937' }}>
              ⚙️ Paramètres
            </Text>
          </View>

          {/* Settings Groups */}
          {SETTINGS_GROUPS.map((group, groupIndex) => (
            <View key={groupIndex} style={{ marginBottom: 24 }}>
              {/* Group Title */}
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                  paddingHorizontal: 4,
                }}
              >
                {group.title}
              </Text>

              {/* Group Items */}
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 12,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: '#E8D5C4',
                }}
              >
                {group.items.map((item, itemIndex) => (
                  <View
                    key={itemIndex}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth:
                        itemIndex < group.items.length - 1 ? 1 : 0,
                      borderBottomColor: '#f0f0f0',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons
                        name={item.icon as any}
                        size={18}
                        color="#D85A30"
                        style={{ marginRight: 12 }}
                      />
                      <Text style={{ fontSize: 14, color: '#1f2937', fontWeight: '500' }}>
                        {item.label}
                      </Text>
                    </View>

                    <Switch
                      value={settings[item.key as keyof typeof settings]}
                      onValueChange={() => handleToggle(item.key)}
                      trackColor={{ false: '#d1d5db', true: '#feccc1' }}
                      thumbColor={settings[item.key as keyof typeof settings] ? '#D85A30' : '#f3f4f6'}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* Danger Zone */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#9ca3af',
                textTransform: 'uppercase',
                marginBottom: 12,
                paddingHorizontal: 4,
              }}
            >
              Zone Danger
            </Text>

            <TouchableOpacity
              onPress={handleClearData}
              style={{
                backgroundColor: '#FEE8E0',
                borderRadius: 10,
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#FECCC1',
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#D85A30" style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 14, color: '#D85A30', fontWeight: '600' }}>
                Effacer toutes les données
              </Text>
            </TouchableOpacity>
          </View>

          {/* Version Info */}
          <View
            style={{
              backgroundColor: '#f3f4f6',
              borderRadius: 10,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 40,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
              RIDE+ v1.0.0
            </Text>
            <Text style={{ fontSize: 11, color: '#d1d5db' }}>
              © 2026 - Tous droits réservés
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}