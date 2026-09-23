import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import MapView, { Marker, Polyline } from "react-native-maps";

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
  const { departure, arrival } = useLocalSearchParams();
  const router = useRouter();

  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRoute, setShowRoute] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (departure && arrival) {
      fetchRoute(departure as string, arrival as string);
    }
  }, [departure, arrival]);

  // ✅ Décoder les points polyline (format Google Maps)
  const decodePolyline = (t: string) => {
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

  // ✅ Récupérer l'itinéraire via Nominatim + OSRM
  const fetchRoute = async (departureLocation: string, arrivalLocation: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🗺️ Récupération positions: ${departureLocation} → ${arrivalLocation}`);

      // 1️⃣ Géocoder le point de départ
      const originResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(departureLocation)}&format=json&limit=1`
      );
      const originData = await originResponse.json();

      if (!originData || originData.length === 0) {
        setError(`Lieu de départ introuvable: ${departureLocation}`);
        setLoading(false);
        return;
      }

      const originLat = parseFloat(originData[0].lat);
      const originLng = parseFloat(originData[0].lon);

      console.log(`✅ Départ trouvé: ${originLat}, ${originLng}`);

      // 2️⃣ Géocoder le point d'arrivée
      const destResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(arrivalLocation)}&format=json&limit=1`
      );
      const destData = await destResponse.json();

      if (!destData || destData.length === 0) {
        setError(`Lieu d'arrivée introuvable: ${arrivalLocation}`);
        setLoading(false);
        return;
      }

      const destLat = parseFloat(destData[0].lat);
      const destLng = parseFloat(destData[0].lon);

      console.log(`✅ Arrivée trouvée: ${destLat}, ${destLng}`);

      // 3️⃣ Récupérer l'itinéraire via OSRM
      const routeResponse = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`
      );
      const routeData = await routeResponse.json();

      if (routeData.code !== "Ok" || !routeData.routes || routeData.routes.length === 0) {
        setError("Impossible de calculer l'itinéraire");
        setLoading(false);
        return;
      }

      const routeInfo = routeData.routes[0];
      const distanceKm = (routeInfo.distance / 1000).toFixed(2);
      const durationMins = Math.round(routeInfo.duration / 60);
      const durationHours = Math.floor(durationMins / 60);
      const durationRemainMins = durationMins % 60;

      let durationText = "";
      if (durationHours > 0) {
        durationText = `${durationHours}h ${durationRemainMins}min`;
      } else {
        durationText = `${durationMins}min`;
      }

      const coordinates = routeInfo.geometry.coordinates;
      const polylineCoords = coordinates.map((c: [number, number]) => ({
        latitude: c[1],
        longitude: c[0],
      }));

      console.log(`✅ Itinéraire: ${distanceKm}km, ${durationText}`);

      setRoute({
        origin: { latitude: originLat, longitude: originLng },
        destination: { latitude: destLat, longitude: destLng },
        polylinePoints: polylineCoords,
        distance: `${distanceKm} km`,
        duration: durationText,
      });
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FBF6EF" }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 16 }}>
          <Ionicons name="alert-circle" size={60} color="#D85A30" />
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#1F2937", marginTop: 16 }}>
            Erreur
          </Text>
          <Text style={{ fontSize: 14, color: "#9CA3AF", marginTop: 8, textAlign: "center" }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: "#D85A30",
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 10,
              marginTop: 20,
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "600" }}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FBF6EF" }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#D85A30" />
          <Text style={{ marginTop: 16, color: "#9CA3AF" }}>Chargement de la map...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FBF6EF" }}>
      {/* Map */}
      {route && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: (route.origin.latitude + route.destination.latitude) / 2,
            longitude: (route.origin.longitude + route.destination.longitude) / 2,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {/* Polyline - itinéraire (optionnel) */}
          {showRoute && (
            <Polyline
              coordinates={route.polylinePoints}
              strokeColor="#D85A30"
              strokeWidth={4}
            />
          )}

          {/* Marker - Point de départ (Conducteur) */}
          <Marker
            coordinate={route.origin}
            title="Départ du conducteur"
            description={departure}
            pinColor="#EF4444"
          />

          {/* Marker - Point d'arrivée (Passager) */}
          <Marker
            coordinate={route.destination}
            title="Position du passager"
            description={arrival}
            pinColor="#10B981"
          />
        </MapView>
      )}

      {/* Header */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "#FFF",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#E8D5C4",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#1F2937", flex: 1, marginLeft: 12 }}>
          {departure} → {arrival}
        </Text>
      </View>

      {/* Bottom Info Panel */}
      {route && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#FFF",
            borderTopWidth: 1,
            borderTopColor: "#E8D5C4",
            paddingHorizontal: 16,
            paddingVertical: 16,
          }}
        >
          {/* Info: Distance et Durée */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Ionicons name="navigate" size={24} color="#D85A30" />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: "#1F2937",
                  marginTop: 4,
                }}
              >
                {route.distance}
              </Text>
            </View>

            <View
              style={{
                height: 40,
                width: 1,
                backgroundColor: "#E8D5C4",
              }}
            />

            <View style={{ alignItems: "center" }}>
              <Ionicons name="time" size={24} color="#D85A30" />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: "#1F2937",
                  marginTop: 4,
                }}
              >
                {route.duration}
              </Text>
            </View>
          </View>

          {/* Bouton Afficher/Masquer itinéraire */}
          <TouchableOpacity
            onPress={() => setShowRoute(!showRoute)}
            style={{
              backgroundColor: showRoute ? "#D85A30" : "#3B82F6",
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name={showRoute ? "close" : "road"} size={18} color="#FFF" />
              <Text
                style={{
                  color: "#FFF",
                  fontWeight: "700",
                  fontSize: 14,
                  marginLeft: 8,
                }}
              >
                {showRoute ? "Masquer l'itinéraire" : "Afficher l'itinéraire"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Bouton Retour */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: "#F3F4F6",
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#1F2937",
                fontWeight: "700",
                fontSize: 14,
              }}
            >
              Retour
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
