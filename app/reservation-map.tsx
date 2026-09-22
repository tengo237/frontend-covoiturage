import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline } from 'react-native-maps';

interface TripData {
  id?: number;
  departure_location?: string;
  arrival_location?: string;
  departure_time?: string;
  price_per_seat?: number;
  driver?: {
    name?: string;
    phone?: string;
  };
  vehicle?: {
    brand?: string;
    model?: string;
    license_plate?: string;
  };
}

export default function ReservationMap() {
  const router = useRouter();
  const { reservationId, tripData } = useLocalSearchParams();

  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 3.8667,
    longitude: 11.5167,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });

  useEffect(() => {
    loadTripData();
  }, [tripData]);

  const loadTripData = () => {
    try {
      if (tripData) {
        const parsedTrip = JSON.parse(tripData as string);
        console.log('📍 Trip Data:', parsedTrip);
        setTrip(parsedTrip);
      }
    } catch (error) {
      console.error('Erreur parsing trip data:', error);
      Alert.alert('Erreur', 'Impossible de charger les informations du trajet');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#D85A30" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: '#fff',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#E8D5C4',
          flexDirection: 'row',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12 }}
        >
          <Ionicons name="chevron-back" size={28} color="#1f2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#1f2937' }}>
          Suivi du Trajet 🗺️
        </Text>
      </View>

      {/* Map */}
      <MapView
        style={{ flex: 1 }}
        initialRegion={region}
        onRegionChange={setRegion}
      >
        {/* Marqueur Départ */}
        <Marker
          coordinate={{ latitude: 3.8667, longitude: 11.5167 }}
          title="Départ"
          description={trip?.departure_location || 'Point de départ'}
          pinColor="#D85A30"
        />

        {/* Marqueur Arrivée */}
        <Marker
          coordinate={{ latitude: 3.9, longitude: 11.55 }}
          title="Arrivée"
          description={trip?.arrival_location || 'Destination'}
          pinColor="#378ADD"
        />

        {/* Ligne du trajet */}
        <Polyline
          coordinates={[
            { latitude: 3.8667, longitude: 11.5167 },
            { latitude: 3.9, longitude: 11.55 },
          ]}
          strokeColor="#D85A30"
          strokeWidth={4}
          geodesic
          lineDashPattern={[0]}
        />
      </MapView>

      {/* Info Panel */}
      <View
        style={{
          backgroundColor: '#fff',
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: '#E8D5C4',
        }}
      >
        {/* Infos Trajet */}
        {trip && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: '500' }}>
                CONDUCTEUR
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937', marginTop: 4 }}>
                {trip.driver?.name || 'Non spécifié'}
              </Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: '500' }}>
                VÉHICULE
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937', marginTop: 4 }}>
                {trip.vehicle?.brand} {trip.vehicle?.model}
              </Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                {trip.vehicle?.license_plate}
              </Text>
            </View>

            <View>
              <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: '500' }}>
                TRAJET
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#1f2937', marginTop: 4 }}>
                {trip.departure_location} → {trip.arrival_location}
              </Text>
            </View>
          </View>
        )}

        {/* Boutons Action */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#378ADD',
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={() => {
              console.log('📞 Appel au conducteur');
              Alert.alert('Appel', `Appel au conducteur: ${trip?.driver?.phone || 'N/A'}`);
            }}
          >
            <Ionicons name="call" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12, marginLeft: 6 }}>
              Appeler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: '#10b981',
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={() => {
              console.log('🧭 GPS Navigation');
              Alert.alert('GPS', 'Lancer la navigation GPS');
            }}
          >
            <Ionicons name="navigate" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12, marginLeft: 6 }}>
              GPS
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}