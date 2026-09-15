import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { useUser } from "../../context/UserContext";

export default function AdminLayout() {
  const { isAdmin, loading } = useUser();

  // ✅ Si en cours de chargement, afficher rien
  if (loading) {
    return null;
  }

  // ✅ Si pas admin, afficher une vue vide (pas de redirection)
  if (!isAdmin) {
    return <View style={{ flex: 1 }} />;
  }

  // ✅ Admin connecté, afficher le layout
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
