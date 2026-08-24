import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  Alert,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AnimatedPressable from "../components/AnimatedPressable";
import { useUser } from "../context/UserContext";

function TextField(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <View className="mb-4">
      <Text className="font-body-medium text-xs text-brun-muted mb-1.5">{label}</Text>
      <TextInput
        className="font-body border border-brun/15 rounded-2xl px-4 py-3.5 text-sm text-brun bg-white"
        placeholderTextColor="#8C7A6B80"
        {...rest}
      />
    </View>
  );
}

export default function EditProfile() {
  const { profile, updateProfile } = useUser();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [photoUri, setPhotoUri] = useState(profile.photoUri);
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "Autorisez l'accès à vos photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleSave = () => {
    updateProfile({ name, email, phone, photoUri });
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-4">
        <View className={`w-full ${isTablet ? "max-w-xl self-center" : ""}`}>
          <View className="flex-row items-center justify-between mb-8">
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
            </Pressable>
            <Text className="font-display-bold text-brun text-lg">Modifier le profil</Text>
            <View style={{ width: 22 }} />
          </View>

          <View className="items-center mb-8">
            <Pressable onPress={pickPhoto} className="relative">
              <View className="w-24 h-24 rounded-full bg-teal-50 items-center justify-center overflow-hidden">
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <Ionicons name="person" size={40} color="#0F6E56" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-terre-600 items-center justify-center border-2 border-creme">
                <Ionicons name="camera" size={14} color="#FBF6EF" />
              </View>
            </Pressable>
            <Text className="font-body text-xs text-brun-muted mt-3">
              Toucher la photo pour la modifier
            </Text>
          </View>

          <TextField label="Nom complet" placeholder="Votre nom" value={name} onChangeText={setName} />
          <TextField
            label="Email"
            placeholder="vous@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextField
            label="Téléphone"
            placeholder="6XX XXX XXX"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <View style={{ height: 24 }} />

          <AnimatedPressable onPress={handleSave} className="bg-terre-600 rounded-2xl py-4 items-center mb-6">
            <Text className="font-body-semibold text-creme text-base">Enregistrer</Text>
          </AnimatedPressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
