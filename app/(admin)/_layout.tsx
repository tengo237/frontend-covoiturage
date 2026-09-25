import React from "react";
import { View, Text, Pressable, SafeAreaView, ActivityIndicator } from "react-native";
import { Stack, Redirect, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../context/UserContext";
import { router } from "expo-router";

export default function AdminLayout() {
  const { user, loading } = useUser();
  const pathname = usePathname();

  console.log('[ADMIN LAYOUT] loading:', loading);
  console.log('[ADMIN LAYOUT] user?.is_admin:', user?.is_admin);

  // ============================================
  // CHARGEMENT
  // ============================================
  if (loading) {
    console.log('[ADMIN LAYOUT] Loading...');
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D85A30" />
        <Text style={{ marginTop: 12, color: '#3D2B1F', fontSize: 14, fontWeight: '500' }}>
          Chargement...
        </Text>
      </SafeAreaView>
    );
  }

  // ============================================
  // REDIRECTION SI PAS ADMIN
  // ============================================
  if (!user?.is_admin) {
    console.log('[ADMIN LAYOUT] ❌ Pas admin! Redirection vers login');
    return <Redirect href="/login" />;
  }

  // ============================================
  // CONTENU ADMIN
  // ============================================
  console.log('[ADMIN LAYOUT] ✅ Admin autorisé!');

  const navItems = [
    { label: 'Dashboard', icon: 'home-outline', href: '/(admin)', active: pathname === '/(admin)' },
    { label: 'Dossiers', icon: 'document-text-outline', href: '/(admin)/driver-applications', active: pathname.includes('driver-applications') },
    { label: 'Signalements', icon: 'flag-outline', href: '/(admin)/signalements', active: pathname.includes('signalements') },
    { label: 'Utilisateurs', icon: 'people-outline', href: '/(admin)/users', active: pathname.includes('users') },
  ];

  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
      {/* HEADER SIMPLE */}
      <View
        style={{
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e5e5',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                backgroundColor: '#D85A30',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="shield-checkmark" size={20} color="#fff" />
            </View>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#3D2B1F' }}>
                Administration
              </Text>
              <Text style={{ fontSize: 12, color: '#8C7A6B', marginTop: 2 }}>
                {user?.name}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleLogout}
            hitSlop={10}
            style={({ pressed }) => ({
              padding: 8,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons name="log-out-outline" size={20} color="#D8453C" />
          </Pressable>
        </View>
      </View>

      {/* CONTENU PRINCIPAL */}
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </View>

      {/* BOTTOM NAVIGATION (Comme le driver) */}
      <View
        style={{
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e5e5',
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingVertical: 8,
        }}
      >
        {navItems.map((item) => (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href)}
            style={({ pressed }) => ({
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
              paddingHorizontal: 12,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Ionicons
              name={item.icon as any}
              size={24}
              color={item.active ? '#D85A30' : '#8C7A6B'}
            />
            <Text
              style={{
                fontSize: 11,
                fontWeight: item.active ? '700' : '500',
                color: item.active ? '#D85A30' : '#8C7A6B',
                marginTop: 4,
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}
