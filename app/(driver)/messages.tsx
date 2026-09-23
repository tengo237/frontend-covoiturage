import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "../../context/UserContext";

const API_BASE_URL = "http://12.0.3.9:8000";

interface Conversation {
  id: number;
  user_1_id: number;
  user_2_id: number;
  reservation_id: number | null;
  created_at: string;
  updated_at: string;
  user_1?: {
    id: number;
    name: string;
    photo_url: string | null;
    email: string;
  };
  user_2?: {
    id: number;
    name: string;
    photo_url: string | null;
    email: string;
  };
}

export default function MessagesScreen() {
  const router = useRouter();
  const { user, token } = useUser();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Charger les conversations au montage et au retour
  useFocusEffect(
    React.useCallback(() => {
      loadConversations();
    }, [token])
  );

  const loadConversations = async () => {
    try {
      setLoading(true);
      const storedToken = token || (await AsyncStorage.getItem("userToken"));

      if (!storedToken) {
        console.log("❌ Pas de token");
        return;
      }

      console.log("🔵 Chargement des conversations...");

      const response = await fetch(`${API_BASE_URL}/api/messages/my-conversations`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`📩 Status: ${response.status}`);

      if (!response.ok) {
        console.log("❌ Erreur chargement conversations");
        setConversations([]);
        return;
      }

      const data = await response.json();
      console.log("🟢 Conversations chargées:", data.conversations?.length ?? 0);

      setConversations(data.conversations || []);
    } catch (error) {
      console.error("❌ Erreur:", error);
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  // ✅ Déterminer l'autre utilisateur
  const getOtherUser = (conversation: Conversation) => {
    if (user?.id === conversation.user_1_id) {
      return conversation.user_2;
    } else {
      return conversation.user_1;
    }
  };

  // ✅ Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("fr-CM", { hour: "2-digit", minute: "2-digit" });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hier";
    } else {
      return date.toLocaleDateString("fr-CM");
    }
  };

  // ✅ Récupérer l'URL de la photo
  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.includes("12.0.13.180")) return url.replace("12.0.13.180", "12.0.3.9");
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  // ✅ Rendre un élément conversation
  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherUser = getOtherUser(item);

    if (!otherUser) {
      return null;
    }

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/conversation-detail",
            params: { conversationId: item.id, userId: otherUser.id },
          })
        }
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#E8D5C4",
          alignItems: "center",
        }}
      >
        {/* Photo de profil */}
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: "#F0F0F0",
            marginRight: 12,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          {getImageUrl(otherUser.photo_url) ? (
            <Image
              source={{ uri: getImageUrl(otherUser.photo_url) }}
              style={{ width: 50, height: 50 }}
            />
          ) : (
            <Ionicons name="person-circle" size={50} color="#D85A30" />
          )}
        </View>

        {/* Info conversation */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#1F2937",
              marginBottom: 4,
            }}
          >
            {otherUser.name}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: "#9CA3AF",
            }}
          >
            {otherUser.email}
          </Text>
        </View>

        {/* Date */}
        <Text
          style={{
            fontSize: 11,
            color: "#9CA3AF",
            marginLeft: 8,
          }}
        >
          {formatDate(item.updated_at)}
        </Text>

        {/* Flèche */}
        <Ionicons
          name="chevron-forward"
          size={20}
          color="#D85A30"
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FBF6EF" }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#E8D5C4",
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "800",
            color: "#1F2937",
          }}
        >
          Messages
        </Text>
      </View>

      {/* Conversations List */}
      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#D85A30" />
        </View>
      ) : conversations.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <Ionicons name="chatbubbles-outline" size={60} color="#D85A30" />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#1F2937",
              marginTop: 16,
              textAlign: "center",
            }}
          >
            Aucune conversation
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#9CA3AF",
              marginTop: 8,
              textAlign: "center",
            }}
          >
            Les messages apparaîtront ici quand vous communiquerez avec un passager
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#D85A30"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
