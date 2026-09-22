import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUser } from '../../context/UserContext';

const API_BASE_URL = 'http://12.0.3.9:8000';

const getImageUrl = (url: string | null) => {
  if (!url) return 'https://via.placeholder.com/50?text=User';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

interface Conversation {
  id: number;
  user_1_id: number;
  user_2_id: number;
  user_1?: {
    id: number;
    name: string;
    email: string;
    photo_url?: string;
  };
  user_2?: {
    id: number;
    name: string;
    email: string;
    photo_url?: string;
  };
  last_message?: {
    content: string;
    sender_id: number;
    created_at: string;
  };
  unread_count?: number;
  created_at?: string;
  updated_at?: string;
}

export default function Messages() {
  const router = useRouter();
  const { token, user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('🔄 Messages useEffect triggered');
    loadConversations();
  }, [token]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      console.log('🔵 Chargement des conversations...');

      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté');
        setLoading(false);
        return;
      }

      const url = `${API_BASE_URL}/api/messages/my-conversations`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📩 Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur chargement');
      }

      const data = await response.json();
      console.log('🟢 Conversations chargées:', data.conversations?.length || 0);
      setConversations(data.conversations || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('🔴 Erreur:', message);
      Alert.alert('❌ Erreur', message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  };

  const getOtherUser = (conversation: Conversation) => {
    if (!user) return null;
    if (conversation.user_1_id === user.id) {
      return conversation.user_2;
    }
    return conversation.user_1;
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.last_message) {
      return 'Pas de messages';
    }

    const isFromMe = conversation.last_message.sender_id === user?.id;
    const prefix = isFromMe ? 'Vous: ' : '';
    return prefix + conversation.last_message.content;
  };

  const getLastMessageTime = (conversation: Conversation) => {
    if (!conversation.last_message?.created_at) return '';

    const date = new Date(conversation.last_message.created_at);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;

    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  };

  const handleConversationClick = (conversation: Conversation) => {
    const otherUser = getOtherUser(conversation);
    console.log('💬 Ouverture conversation avec:', otherUser?.name);

    router.push({
      pathname: '/conversation-detail',
      params: {
        conversationId: conversation.id.toString(),
        otherUserId: (otherUser?.id || '').toString(),
        otherUserName: otherUser?.name || 'Utilisateur',
        otherUserPhoto: otherUser?.photo_url || '',
      },
    });
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherUser = getOtherUser(item);

    if (!otherUser) return null;

    const unreadCount = item.unread_count || 0;
    const hasUnread = unreadCount > 0;

    return (
      <TouchableOpacity
        onPress={() => handleConversationClick(item)}
        activeOpacity={0.7}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
          }}
        >
          {/* Avatar */}
          <Image
            source={{ uri: getImageUrl(otherUser.photo_url) }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#f0f0f0',
              borderWidth: 2,
              borderColor: hasUnread ? '#D85A30' : '#E8D5C4',
            }}
          />

          {/* Infos */}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: hasUnread ? '700' : '600',
                  color: '#1f2937',
                  flex: 1,
                }}
              >
                {otherUser.name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: '#9ca3af',
                  marginLeft: 8,
                }}
              >
                {getLastMessageTime(item)}
              </Text>
            </View>

            {/* Dernier message */}
            <Text
              style={{
                fontSize: 13,
                color: hasUnread ? '#1f2937' : '#9ca3af',
                marginTop: 4,
                fontWeight: hasUnread ? '500' : '400',
              }}
              numberOfLines={1}
            >
              {getLastMessagePreview(item)}
            </Text>
          </View>

          {/* Badge non-lus */}
          {hasUnread && (
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#D85A30',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 8,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
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
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#1f2937', marginBottom: 4 }}>
          Messages 💬
        </Text>
        <Text style={{ fontSize: 14, color: '#9ca3af' }}>
          {conversations.length} conversation{conversations.length > 1 ? 's' : ''}
        </Text>
      </View>

      {conversations.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="chatbubble-outline" size={56} color="#D1D5DB" />
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#6b7280', marginTop: 16 }}>
            Aucune conversation
          </Text>
          <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
            Vos conversations apparaîtront ici
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}