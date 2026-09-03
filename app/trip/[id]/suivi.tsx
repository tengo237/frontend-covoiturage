import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  Easing,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AnimatedPressable from "../../../components/AnimatedPressable";
import { getTripById } from "../../../lib/trips";

const GEOAPIFY_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_KEY;

const CITY_COORDS: Record<string, [number, number]> = {
  Douala: [4.0511, 9.7679],
  Yaoundé: [3.848, 11.5021],
  Bafoussam: [5.4737, 10.4176],
};

const CATEGORIES = [
  { key: "catering.restaurant", label: "Restaurants", icon: "restaurant-outline" as const },
  { key: "catering.cafe", label: "Cafés", icon: "cafe-outline" as const },
  { key: "accommodation.hotel", label: "Hôtels", icon: "bed-outline" as const },
  { key: "tourism.attraction", label: "Attractions", icon: "camera-outline" as const },
];

// Page HTML Leaflet : vue satellite (Esri World Imagery, gratuit, sans clé),
// interactive (zoom/déplacement au doigt), avec le tracé du trajet et le
// véhicule qui avance. Reçoit des commandes depuis React Native via
// injectJavaScript (recentrer, ajouter des marqueurs de lieux/POI).
function buildMapHtml(start: [number, number], end: [number, number]) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const start = [${start[0]}, ${start[1]}];
    const end = [${end[0]}, ${end[1]}];
    window.map = L.map('map', { zoomControl: false }).fitBounds([start, end], { padding: [60, 60] });

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Esri, Maxar, Earthstar Geographics',
      maxZoom: 19,
    }).addTo(window.map);

    const startIcon = L.divIcon({ className: '', html: '<div style="width:14px;height:14px;border-radius:7px;background:#0F6E56;border:2px solid white"></div>' });
    const endIcon = L.divIcon({ className: '', html: '<div style="width:14px;height:14px;border-radius:7px;background:#D85A30;border:2px solid white"></div>' });
    const carIcon = L.divIcon({
      className: '',
      html: '<div style="width:32px;height:32px;border-radius:16px;background:#17A673;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:18px">🚗</div>',
      iconSize: [32, 32], iconAnchor: [16, 16],
    });

    L.marker(start, { icon: startIcon }).addTo(window.map);
    L.marker(end, { icon: endIcon }).addTo(window.map);
    L.polyline([start, end], { color: '#D85A30', weight: 3, dashArray: '6,8' }).addTo(window.map);

    const carMarker = L.marker(start, { icon: carIcon, zIndexOffset: 1000 }).addTo(window.map);

    const DURATION_MS = 25000;
    const startTime = Date.now();
    function lerp(a, b, t) { return a + (b - a) * t; }
    function tick() {
      const t = Math.min(1, (Date.now() - startTime) / DURATION_MS);
      carMarker.setLatLng([lerp(start[0], end[0], t), lerp(start[1], end[1], t)]);
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'progress', value: Math.round(t * 100) }));
      if (t < 1) requestAnimationFrame(tick);
    }
    tick();

    // Marqueurs de résultats de recherche/POI, gérés depuis React Native.
    window.poiMarkers = [];
    window.clearPoiMarkers = function () {
      window.poiMarkers.forEach(m => window.map.removeLayer(m));
      window.poiMarkers = [];
    };
    window.addPoiMarker = function (lat, lon, label) {
      const icon = L.divIcon({
        className: '',
        html: '<div style="background:white;border-radius:8px;padding:4px 8px;font-size:11px;font-family:sans-serif;box-shadow:0 1px 4px rgba(0,0,0,0.3);white-space:nowrap">' + label + '</div>',
        iconAnchor: [10, 10],
      });
      const m = L.marker([lat, lon], { icon }).addTo(window.map);
      window.poiMarkers.push(m);
    };
    window.recenter = function (lat, lon, zoom) {
      window.map.setView([lat, lon], zoom || 15);
    };
  </script>
</body>
</html>
  `;
}

type SosState = "idle" | "confirming" | "sent";
type SearchResult = { label: string; lat: number; lon: number };

export default function Suivi() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = getTripById(id);
  const { height } = useWindowDimensions();
  const webviewRef = useRef<WebView>(null);

  const [progressPct, setProgressPct] = useState(0);
  const [sosState, setSosState] = useState<SosState>("idle");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (sosState !== "idle") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [sosState]);

  if (!trip) return null;

  const startCoords = CITY_COORDS[trip.from] ?? CITY_COORDS.Douala;
  const endCoords = CITY_COORDS[trip.to] ?? CITY_COORDS.Yaoundé;
  const html = buildMapHtml(startCoords, endCoords);

  // Recherche libre (barre du haut) — API de géocodage Geoapify.
  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 3 || !GEOAPIFY_KEY) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&filter=countrycode:cm&apiKey=${GEOAPIFY_KEY}`
      );
      const json = await res.json();
      const items: SearchResult[] = (json.features || []).map((f: any) => ({
        label: f.properties.formatted,
        lat: f.properties.lat,
        lon: f.properties.lon,
      }));
      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectResult = (r: SearchResult) => {
    setQuery(r.label);
    setResults([]);
    webviewRef.current?.injectJavaScript(`
      window.clearPoiMarkers();
      window.addPoiMarker(${r.lat}, ${r.lon}, ${JSON.stringify(r.label.split(",")[0])});
      window.recenter(${r.lat}, ${r.lon}, 15);
      true;
    `);
  };

  // Recherche par catégorie (bulles) — API Places Geoapify, autour du
  // centre approximatif du trajet.
  const searchCategory = async (categoryKey: string) => {
    if (!GEOAPIFY_KEY) return;
    const centerLat = (startCoords[0] + endCoords[0]) / 2;
    const centerLon = (startCoords[1] + endCoords[1]) / 2;
    try {
      const res = await fetch(
        `https://api.geoapify.com/v2/places?categories=${categoryKey}&filter=circle:${centerLon},${centerLat},15000&limit=15&apiKey=${GEOAPIFY_KEY}`
      );
      const json = await res.json();
      const items = (json.features || []) as any[];
      const script = `
        window.clearPoiMarkers();
        ${items
          .map(
            (f) =>
              `window.addPoiMarker(${f.geometry.coordinates[1]}, ${f.geometry.coordinates[0]}, ${JSON.stringify(
                f.properties.name || f.properties.address_line1 || "Lieu"
              )});`
          )
          .join("\n")}
        true;
      `;
      webviewRef.current?.injectJavaScript(script);
    } catch {}
  };

  const handleSos = () => sosState === "idle" && setSosState("confirming");
  const confirmSos = () => setSosState("sent");
  const cancelSos = () => setSosState("idle");

  return (
    <SafeAreaView className="flex-1 bg-creme" edges={["bottom"]}>
      <View style={{ height: height * 0.5 }} className="relative">
        <WebView
          ref={webviewRef}
          source={{ html }}
          style={{ flex: 1 }}
          onMessage={(e) => {
            try {
              const data = JSON.parse(e.nativeEvent.data);
              if (data.type === "progress") setProgressPct(data.value);
            } catch {}
          }}
        />

        {/* Barre de recherche façon Google Maps, en superposition */}
        <SafeAreaView edges={["top"]} className="absolute top-0 left-0 right-0">
          <View className="flex-row items-center bg-white rounded-full mx-4 mt-2 px-4 py-3 shadow">
            <Pressable onPress={() => router.back()} hitSlop={10} className="mr-2">
              <Ionicons name="arrow-back" size={20} color="#3D2B1F" />
            </Pressable>
            <TextInput
              value={query}
              onChangeText={handleSearch}
              placeholder="Rechercher un lieu"
              placeholderTextColor="#8C7A6B80"
              className="flex-1 font-body text-sm text-brun"
            />
            {searching ? (
              <Ionicons name="hourglass-outline" size={18} color="#8C7A6B" />
            ) : (
              <Ionicons name="search" size={18} color="#8C7A6B" />
            )}
          </View>

          {results.length > 0 && (
            <View className="bg-white mx-4 mt-1 rounded-2xl shadow overflow-hidden">
              <FlatList
                data={results}
                keyExtractor={(_, i) => String(i)}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => selectResult(item)}
                    className="px-4 py-3 border-b border-brun/5 active:opacity-70"
                  >
                    <Text className="font-body text-sm text-brun" numberOfLines={1}>
                      {item.label}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}

          {/* Bulles de catégories */}
          <View className="flex-row px-4 mt-2" style={{ gap: 8 }}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.key}
                onPress={() => searchCategory(c.key)}
                className="flex-row items-center bg-white rounded-full px-3 py-2 shadow"
              >
                <Ionicons name={c.icon} size={14} color="#3D2B1F" />
                <Text className="font-body-medium text-xs text-brun ml-1.5">{c.label}</Text>
              </Pressable>
            ))}
          </View>
        </SafeAreaView>

        {/* Boutons flottants façon Google Maps */}
        <View className="absolute bottom-4 right-4" style={{ gap: 10 }}>
          <Pressable
            onPress={() => webviewRef.current?.injectJavaScript(`window.recenter(${startCoords[0]}, ${startCoords[1]}, 12); true;`)}
            className="w-11 h-11 rounded-full bg-white items-center justify-center shadow"
          >
            <Ionicons name="navigate-outline" size={18} color="#0F6E56" />
          </Pressable>
        </View>
      </View>

      <View className="px-6 pt-4 flex-1">
        <View className="mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="font-body text-xs text-brun-muted">Position du véhicule</Text>
            <Text className="font-body-semibold text-xs text-brun">{progressPct}%</Text>
          </View>
          <View className="h-2 bg-brun/10 rounded-full overflow-hidden">
            <View style={{ height: 8, backgroundColor: "#D85A30", width: `${progressPct}%` }} />
          </View>
        </View>

        <View className="flex-row items-center justify-between bg-white border border-brun/10 rounded-2xl px-4 py-3 mb-6">
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={16} color="#8C7A6B" />
            <Text className="font-body text-xs text-brun ml-2">{trip.driver.name}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="car-outline" size={16} color="#8C7A6B" />
            <Text className="font-body text-xs text-brun ml-2">
              {trip.vehicle.brand} {trip.vehicle.model}
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {sosState === "idle" && (
          <Animated.View style={{ transform: [{ scale: pulse }] }} className="mb-6">
            <AnimatedPressable onPress={handleSos} className="bg-danger-600 rounded-2xl py-4 items-center" scaleTo={0.94}>
              <View className="flex-row items-center">
                <Ionicons name="warning" size={18} color="#FBF6EF" />
                <Text className="font-body-semibold text-creme text-base ml-2">Envoyer une alerte SOS</Text>
              </View>
            </AnimatedPressable>
          </Animated.View>
        )}

        {sosState === "confirming" && (
          <View className="bg-danger-50 border border-danger-400 rounded-2xl p-4 mb-6">
            <Text className="font-body-semibold text-sm text-danger-600 mb-3 text-center">
              Confirmer l'envoi d'une alerte à vos contacts d'urgence ?
            </Text>
            <View className="flex-row" style={{ gap: 10 }}>
              <Pressable onPress={cancelSos} className="flex-1 border border-brun/15 rounded-xl py-3 items-center">
                <Text className="font-body-medium text-sm text-brun-muted">Annuler</Text>
              </Pressable>
              <AnimatedPressable onPress={confirmSos} className="flex-1 bg-danger-600 rounded-xl py-3 items-center">
                <Text className="font-body-medium text-sm text-creme">Confirmer</Text>
              </AnimatedPressable>
            </View>
          </View>
        )}

        {sosState === "sent" && (
          <View className="bg-danger-50 border border-danger-400 rounded-2xl p-4 mb-6">
            <View className="flex-row items-center mb-2">
              <Ionicons name="warning" size={18} color="#A32D2D" />
              <Text className="font-body-semibold text-sm text-danger-600 ml-2">
                Alerte envoyée avec votre position
              </Text>
            </View>
            <Pressable onPress={cancelSos} hitSlop={8}>
              <Text className="font-body text-xs text-danger-600 underline">
                Ce n'était pas une urgence ? Annuler la fausse alerte
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
