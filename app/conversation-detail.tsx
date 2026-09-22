import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';

const API_BASE_URL = 'http://12.0.3.9:8000';

const getImageUrl = (url: string | null) => {
  if (!url) return 'https://via.placeholder.com/50?text=User';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function ConversationDetail() {
  const router = useRouter();
  const { token, user } = useUser();
  const { conversationId, otherUserId, otherUserName, otherUserPhoto } = useLocalSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 2000); // Polling toutes les 2 secondes
    return () => clearInterval(interval);
  }, [conversationId, token]);

  const loadMessages = async () => {
    try {
      if (!token || !conversationId) return;

      const url = `${API_BASE_URL}/api/messages/conversation/${conversationId}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erreur chargement messages');

      const data = await response.json();
      setMessages(data.messages || []);

      // Scroller vers le bas
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('🔴 Erreur loadMessages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      setSending(true);
      const messageContent = messageText.trim();
      setMessageText('');

      const url = `${API_BASE_URL}/api/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: parseInt(conversationId as string),
          content: messageContent,
        }),
      });

      if (!response.ok) throw new Error('Erreur envoi message');

      await loadMessages();
    } catch (error) {
      console.error('🔴 Erreur envoi:', error);
      Alert.alert('❌ Erreur', 'Impossible d\'envoyer le message');
      setMessageText(messageText); // Restaurer le texte
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isFromMe = item.sender_id === user?.id;

    return (
      <View
        style={{
          marginVertical: 6,
          marginHorizontal: 16,
          flexDirection: isFromMe ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
        }}
      >
        {/* Avatar (optionnel) */}
        {!isFromMe && (
          <Image
            source={{ uri: getImageUrl(otherUserPhoto as string) }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#f0f0f0',
              marginHorizontal: 8,
            }}
          />
        )}

        {/* Bulle message */}
        <View
          style={{
            maxWidth: '75%',
            backgroundColor: isFromMe ? '#D85A30' : '#fff',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 18,
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: isFromMe ? '#fff' : '#1f2937',
              fontWeight: '500',
            }}
          >
            {item.content}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: isFromMe ? 'rgba(255,255,255,0.7)' : '#9ca3af',
              marginTop: 4,
              textAlign: 'right',
            }}
          >
            {new Date(item.created_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: '#fff',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#E8D5C4',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
            <Ionicons name="chevron-back" size={28} color="#1f2937" />
          </TouchableOpacity>

          <Image
            source={{ uri: getImageUrl(otherUserPhoto as string) }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#f0f0f0',
              marginRight: 12,
            }}
          />

          <View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>
              {otherUserName}
            </Text>
            <Text style={{ fontSize: 12, color: '#9ca3af' }}>Actif maintenant</Text>
          </View>
        </View>

        <TouchableOpacity style={{ paddingHorizontal: 8 }}>
          <Ionicons name="call" size={22} color="#D85A30" />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#D85A30" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 12 }}
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 }}>
              <Ionicons name="chatbubble-outline" size={48} color="#D1D5DB" />
              <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 12 }}>
                Commencez la conversation
              </Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E8D5C4',
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
          <TextInput
            style={{
              flex: 1,
              backgroundColor: '#FBF6EF',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 10,
              color: '#1f2937',
              fontSize: 14,
              maxHeight: 100,
            }}
            placeholder="Votre message..."
            placeholderTextColor="#9ca3af"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            editable={!sending}
          />

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!messageText.trim() || sending}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: messageText.trim() ? '#D85A30' : '#D1D5DB',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: messageText.trim() ? 1 : 0.6,
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}