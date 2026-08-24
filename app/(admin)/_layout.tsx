import React from "react";
import { Redirect, Stack } from "expo-router";
import { useUser } from "../../context/UserContext";

export default function AdminLayout() {
  const { isAdmin } = useUser();

  if (!isAdmin) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
