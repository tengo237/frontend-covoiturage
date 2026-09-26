import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://12.0.3.9:8000';

interface LatLng {
  latitude: number;
  longitude: number;
}

interface RouteData {
  origin: LatLng;
  destination: LatLng;
  polylinePoints: LatLng[];
  distance: string;
  duration: string;
}

export default function ReservationMapScreen() {
  const { departure, arrival, reservationId } = useLocalSearchParams();
  const router = useRouter();

  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRoute, setShowRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<'loading' | 'cache' | 'fresh'>('loading');

  useEffect(() => {
    if (departure && arrival) {
      fetchRoute(departure as string, arrival as string);
    }
  }, [departure, arrival]);

  // ✅ Décoder les points polyline (format OSRM)
  const decodePolyline = (t: string): LatLng[] => {
    const points: LatLng[] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < t.length) {
      let result = 0;
      let shift = 0;
      let b;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      result = 0;
      shift = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

  // ✅ Récupérer l'itinéraire avec CACHE optimisé
  const fetchRoute = async (departureLocation: string, arrivalLocation: string) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = `route_${departureLocation}_${arrivalLocation}`;
      
      console.log(`🗺️ Récupération route: ${departureLocation} → ${arrivalLocation}`);

      // 1️⃣ VÉRIFIER LE CACHE D'ABORD
      const cachedRoute = await AsyncStorage.getItem(cacheKey);
      if (cachedRoute) {
        console.log('⚡ Cache trouvé! Affichage instantané');
        setCacheStatus('cache');
        setRoute(JSON.parse(cachedRoute));
        setLoading(false);
        return;
      }

      setCacheStatus('fresh');
      console.log('🔄 Pas de cache, fetching OSRM...');

      // 2️⃣ RÉCUPÉRER LES COORDONNÉES DEPUIS LE BACKEND
      // Le backend retourne maintenant:
      // {
      //   "departure_location": "Yaoundé",
      //   "departure_latitude": 3.8667,
      //   "departure_longitude": 11.5167,
      //   "arrival_location": "Douala",
      //   "arrival_latitude": 4.0511,
      //   "arrival_longitude": 9.7679
      // }

      // Pour ce premier call, on utilise les coordonnées passées en params
      // Mais idéalement, on devrait fetcher la réservation depuis le backend
      // qui retournerait les coordonnées précises
      
      // VALEURS PAR DÉFAUT (coordonnées villes Cameroun)
      const COORDS: Record<string, LatLng> = {
        'yaoundé': { latitude: 3.8667, longitude: 11.5167 },
        'douala': { latitude: 4.0511, longitude: 9.7679 },
        'bafoussam': { latitude: 5.7679, longitude: 10.4167 },
        'kribi': { latitude: 2.9333, longitude: 9.9167 },
        'buea': { latitude: 4.1628, longitude: 9.2410 },
        'bamenda': { latitude: 5.9631, longitude: 10.1591 },
        'garoua': { latitude: 9.3077, longitude: 13.3948 },
        'maroua': { latitude: 10.5916, longitude: 14.3055 },
      };

      const originLoc = departureLocation.toLowerCase();
      const destLoc = arrivalLocation.toLowerCase();

      const origin = COORDS[originLoc] || COORDS['yaoundé'];
      const destination = COORDS[destLoc] || COORDS['douala'];

      console.log(`📍 Coordonnées trouvées:`);
      console.log(`   Départ: ${origin.latitude}, ${origin.longitude}`);
      console.log(`   Arrivée: ${destination.latitude}, ${destination.longitude}`);

      // 3️⃣ APPELER OSRM (ROUTE SERVICE)
      console.log('🔄 Appel OSRM...');
      
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&steps=true&geometries=polyline`;
      
      console.log(`📡 URL: ${osrmUrl}`);

      const routeResponse = await fetch(osrmUrl);
      
      if (!routeResponse.ok) {
        throw new Error(`OSRM Error: ${routeResponse.status}`);
      }

      const routeData = await routeResponse.json();

      if (!routeData.routes || routeData.routes.length === 0) {
        setError('Itinéraire non trouvé');
        setLoading(false);
        return;
      }

      const firstRoute = routeData.routes[0];
      const geometry = firstRoute.geometry;
      const distance = (firstRoute.distance / 1000).toFixed(1); // km
      const duration = Math.round(firstRoute.duration / 60); // minutes

      // Décoder polyline
      const polylinePoints = decodePolyline(geometry);

      const newRoute: RouteData = {
        origin,
        destination,
        polylinePoints,
        distance: `${distance} km`,
        duration: `${duration} min`,
      };

      console.log(`✅ Route chargée: ${distance}km, ${duration}min`);

      // 4️⃣ SAUVEGARDER EN CACHE
      await AsyncStorage.setItem(cacheKey, JSON.stringify(newRoute));
      console.log(`💾 Route sauvegardée en cache`);

      setRoute(newRoute);
      setLoading(false);

    } catch (err) {
      console.error('❌ Erreur:', err);
      const errorMsg = err instanceof Error ? err.message : 'Erreur connexion';
      setError(errorMsg);
      setLoading(false);
      Alert.alert('Erreur', errorMsg);
    }
  };

  // ✅ Effacer le cache (bouton debug)
  const clearCache = async () => {
    try {
      const cacheKey = `route_${departure}_${arrival}`;
      await AsyncStorage.removeItem(cacheKey);
      Alert.alert('Cache effacé', 'Rechargez la page');
    } catch (err) {
      console.error('Erreur effacement cache:', err);
    }
  };

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Ionicons name="alert-circle" size={56} color="#EF4444" />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', marginTop: 16, textAlign: 'center' }}>
            Erreur chargement
          </Text>
          <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: '#D85A30',
              borderRadius: 12,
              paddingHorizontal: 24,
              paddingVertical: 12,
              marginTop: 20,
            }}
          >
            <Text style={{ color: '#FFF', fontWeight: '700' }}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
      {/* MAP */}
      {route && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: (route.origin.latitude + route.destination.latitude) / 2,
            longitude: (route.origin.longitude + route.destination.longitude) / 2,
            latitudeDelta: Math.abs(route.origin.latitude - route.destination.latitude) + 0.5,
            longitudeDelta: Math.abs(route.origin.longitude - route.destination.longitude) + 0.5,
          }}
        >
          {/* Polyline (Route) */}
          {showRoute && (
            <Polyline
              coordinates={route.polylinePoints}
              strokeColor="#D85A30"
              strokeWidth={3}
              geodesic={true}
            />
          )}

          {/* Marker - Point de départ */}
          <Marker
            coordinate={route.origin}
            title="Départ"
            description={departure}
            pinColor="#EF4444"
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#EF4444',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: '#FFF',
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 18 }}>A</Text>
            </View>
          </Marker>

          {/* Marker - Point d'arrivée */}
          <Marker
            coordinate={route.destination}
            title="Arrivée"
            description={arrival}
            pinColor="#10B981"
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#10B981',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 3,
                borderColor: '#FFF',
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '800', fontSize: 18 }}>B</Text>
            </View>
          </Marker>
        </MapView>
      )}

      {/* LOADING */}
      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
          }}
        >
          <View
            style={{
              backgroundColor: '#FFF',
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color="#D85A30" />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', marginTop: 16 }}>
              Chargement de la route...
            </Text>
            <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
              {cacheStatus === 'cache' ? '⚡ Depuis le cache' : '🔄 Calcul itinéraire'}
            </Text>
          </View>
        </View>
      )}

      {/* HEADER */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFF',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#E8D5C4',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            color: '#1F2937',
            flex: 1,
            marginLeft: 12,
          }}
          numberOfLines={1}
        >
          {departure} → {arrival}
        </Text>
        {/* Badge Cache */}
        {cacheStatus === 'cache' && (
          <View
            style={{
              backgroundColor: '#DCFCE7',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              marginLeft: 8,
            }}
          >
            <Text style={{ fontSize: 10, color: '#0F6E56', fontWeight: '600' }}>⚡ Cache</Text>
          </View>
        )}
      </View>

      {/* BOTTOM INFO PANEL */}
      {route && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#FFF',
            borderTopWidth: 1,
            borderTopColor: '#E8D5C4',
            paddingHorizontal: 16,
            paddingVertical: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          {/* Distance et Durée */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
              alignItems: 'center',
              marginBottom: 16,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#E8D5C4',
            }}
          >
            {/* Distance */}
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: '#FEE2E2',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Ionicons name="navigate" size={24} color="#D85A30" />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }}>
                {route.distance}
              </Text>
              <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Distance</Text>
            </View>

            {/* Durée */}
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 25,
                  backgroundColor: '#DBEAFE',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Ionicons name="time" size={24} color="#3B82F6" />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }}>
                {route.duration}
              </Text>
              <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>Durée</Text>
            </View>
          </View>

          {/* Boutons */}
          <View style={{ gap: 12 }}>
            {/* Afficher/Masquer itinéraire */}
            <TouchableOpacity
              onPress={() => setShowRoute(!showRoute)}
              style={{
                backgroundColor: showRoute ? '#D85A30' : '#3B82F6',
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <Ionicons
                name={showRoute ? 'close-circle' : 'road'}
                size={18}
                color="#FFF"
              />
              <Text
                style={{
                  color: '#FFF',
                  fontWeight: '700',
                  fontSize: 14,
                  marginLeft: 8,
                }}
              >
                {showRoute ? 'Masquer itinéraire' : 'Afficher itinéraire'}
              </Text>
            </TouchableOpacity>

            {/* Retour */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                backgroundColor: '#F3F4F6',
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#1F2937',
                  fontWeight: '700',
                  fontSize: 14,
                }}
              >
                Retour
              </Text>
            </TouchableOpacity>

            {/* Debug: Clear Cache */}
            <TouchableOpacity
              onPress={clearCache}
              style={{
                backgroundColor: '#F9FAFB',
                borderRadius: 12,
                paddingVertical: 8,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E5E7EB',
              }}
            >
              <Text style={{ color: '#9CA3AF', fontWeight: '500', fontSize: 11 }}>
                🔄 Effacer cache
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
