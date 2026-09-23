import React from "react";
import { View, Text, Pressable, ScrollView, Alert, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useUser } from "../../context/UserContext";

const API_BASE_URL = "http://12.0.3.9:8000";

export default function DriverProfil() {
  // ✅ Charger user ET vehicle depuis le context
  const { user, vehicle, logout } = useUser();

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FBF6EF", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontFamily: "body", fontSize: 14, color: "#9CA3AF" }}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FBF6EF" }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }} showsVerticalScrollIndicator={false}>
        
        {/* ===== PROFILE HEADER ===== */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          {/* Avatar */}
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#DCFCE7",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}>
            <Ionicons name="person" size={44} color="#0F6E56" />
          </View>

          {/* Name & Email */}
          <Text style={{ fontWeight: "800", fontSize: 18, color: "#1F2937", marginBottom: 4 }}>
            {user.name}
          </Text>
          <Text style={{ fontWeight: "400", fontSize: 14, color: "#9CA3AF", marginBottom: 12 }}>
            {user.email}
          </Text>

          {/* Badge */}
          <View style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: "#DCFCE7",
            borderWidth: 1,
            borderColor: "#6EE7B7",
          }}>
            <Ionicons name="car-sport" size={14} color="#0F6E56" />
            <Text style={{ fontWeight: "500", fontSize: 12, color: "#0F6E56", marginLeft: 6 }}>
              Conducteur vérifié
            </Text>
          </View>
        </View>

        {/* ===== VEHICLE SECTION ===== */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontWeight: "600", fontSize: 12, color: "#0F6E56", marginBottom: 8, textTransform: "uppercase" }}>
            Véhicule
          </Text>

          {vehicle ? (
            // ✅ VÉHICULE EXISTE: Afficher les détails + PHOTO
            <View>
              {/* Carte véhicule */}
              <Pressable
                onPress={() => router.push("/edit-vehicle")}
                style={{
                  backgroundColor: "#FFF",
                  borderWidth: 1,
                  borderColor: "#E8D5C4",
                  borderRadius: 16,
                  overflow: "hidden",
                  marginBottom: 12,
                  active: { opacity: 0.7 },
                }}
              >
                {/* ✅ PHOTO DU VÉHICULE */}
                {vehicle.vehicle_photo_url ? (
                  <Image
                    source={{
                      uri: `${API_BASE_URL}${vehicle.vehicle_photo_url}`,
                    }}
                    style={{
                      width: "100%",
                      height: 160,
                      backgroundColor: "#F3F4F6",
                    }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: 160,
                      backgroundColor: "#F3F4F6",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="car-outline" size={48} color="#D1D5DB" />
                  </View>
                )}

                {/* Détails du véhicule */}
                <View style={{ padding: 16 }}>
                  {/* Marque + Modèle */}
                  <Text style={{ fontWeight: "600", fontSize: 16, color: "#1F2937", marginBottom: 4 }}>
                    {vehicle.brand} {vehicle.model}
                  </Text>

                  {/* Plaque + Couleur */}
                  <Text style={{ fontWeight: "400", fontSize: 13, color: "#9CA3AF", marginBottom: 8 }}>
                    {vehicle.plate} • {vehicle.color}
                  </Text>

                  {/* Status + Modifier */}
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981", marginRight: 6 }} />
                      <Text style={{ fontWeight: "500", fontSize: 12, color: "#10B981" }}>
                        Enregistré
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Text style={{ fontWeight: "500", fontSize: 12, color: "#0F6E56", marginRight: 6 }}>
                        Modifier
                      </Text>
                      <Ionicons name="chevron-forward" size={16} color="#0F6E56" />
                    </View>
                  </View>
                </View>
              </Pressable>

              {/* Bouton Ajouter un autre véhicule */}
              <Pressable
                onPress={() => router.push("/add-vehicle")}
                style={{
                  backgroundColor: "#FFF",
                  borderWidth: 1,
                  borderColor: "#E8D5C4",
                  borderRadius: 16,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  active: { opacity: 0.7 },
                }}
              >
                <Ionicons name="add-circle-outline" size={18} color="#D85A30" />
                <Text style={{ fontWeight: "600", fontSize: 14, color: "#D85A30", marginLeft: 8 }}>
                  Ajouter un autre véhicule
                </Text>
              </Pressable>
            </View>
          ) : (
            // ❌ PAS DE VÉHICULE: Bouton pour en ajouter
            <Pressable
              onPress={() => router.push("/add-vehicle")}
              style={{
                backgroundColor: "#FFF",
                borderWidth: 1,
                borderColor: "#E8D5C4",
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                active: { opacity: 0.7 },
              }}
            >
              <View>
                <Text style={{ fontWeight: "600", fontSize: 14, color: "#1F2937", marginBottom: 4 }}>
                  Votre véhicule
                </Text>
                <Text style={{ fontWeight: "400", fontSize: 13, color: "#9CA3AF" }}>
                  Ajouter votre premier véhicule
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontWeight: "500", fontSize: 12, color: "#0F6E56", marginRight: 8 }}>
                  Ajouter
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#0F6E56" />
              </View>
            </Pressable>
          )}
        </View>

        {/* ===== MENU ITEMS ===== */}
        <View style={{ borderTopWidth: 1, borderTopColor: "#E8D5C4" }}>
          
          {/* Modifier profil */}
          <Pressable
            onPress={() => router.push("/edit-profile")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#E8D5C4",
              active: { opacity: 0.7 },
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="person-outline" size={20} color="#3D2B1F" />
              <Text style={{ fontWeight: "400", fontSize: 14, color: "#1F2937", marginLeft: 12 }}>
                Modifier mes informations
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8C7A6B" />
          </Pressable>

          {/* Voir en tant que passager */}
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#E8D5C4",
              active: { opacity: 0.7 },
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="swap-horizontal-outline" size={20} color="#3D2B1F" />
              <Text style={{ fontWeight: "400", fontSize: 14, color: "#1F2937", marginLeft: 12 }}>
                Voir en tant que passager
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8C7A6B" />
          </Pressable>

          {/* Paramètres */}
          <Pressable
            onPress={() => {}}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: "#E8D5C4",
              active: { opacity: 0.7 },
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="settings-outline" size={20} color="#3D2B1F" />
              <Text style={{ fontWeight: "400", fontSize: 14, color: "#1F2937", marginLeft: 12 }}>
                Paramètres
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8C7A6B" />
          </Pressable>

          {/* Aide */}
          <Pressable
            onPress={() => {}}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 16,
              active: { opacity: 0.7 },
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="help-circle-outline" size={20} color="#3D2B1F" />
              <Text style={{ fontWeight: "400", fontSize: 14, color: "#1F2937", marginLeft: 12 }}>
                Aide & Support
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8C7A6B" />
          </Pressable>
        </View>

        {/* ===== LOGOUT BUTTON ===== */}
        <Pressable
          onPress={handleLogout}
          style={{
            marginTop: 32,
            marginBottom: 32,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: "#FEE2E4",
            borderWidth: 1,
            borderColor: "#FCA5AC",
            borderRadius: 12,
            alignItems: "center",
            active: { opacity: 0.7 },
          }}
        >
          <Text style={{ fontWeight: "600", fontSize: 14, color: "#DC2626" }}>
            Se déconnecter
          </Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}
