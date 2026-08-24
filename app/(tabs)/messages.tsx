import React from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const CONVERSATIONS = [
  { id: "1", name: "Marc Ateba", lastMessage: "D'accord, je vous attends à 14h", time: "10:32", unread: true },
  { id: "2", name: "Chantal Mballa", lastMessage: "Le colis est bien arrivé, merci !", time: "Hier", unread: false },
];

export default function Messages() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-medium text-gray-900">Messages</Text>
      </View>

      <FlatList
        data={CONVERSATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24 }}
        ItemSeparatorComponent={() => <View className="h-px bg-gray-100" />}
        renderItem={({ item }) => (
          <Pressable className="flex-row items-center py-4 active:opacity-70">
            <View className="w-12 h-12 rounded-full bg-primary-50 items-center justify-center mr-3">
              <Ionicons name="person-outline" size={22} color="#185FA5" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-900">{item.name}</Text>
              <Text
                className={`text-xs mt-0.5 ${item.unread ? "text-gray-900" : "text-gray-500"}`}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-400">{item.time}</Text>
              {item.unread && (
                <View className="w-2 h-2 rounded-full bg-primary-600 mt-1" />
              )}
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Ionicons name="chatbubble-outline" size={40} color="#D1D5DB" />
            <Text className="text-sm text-gray-400 mt-3">
              Aucune conversation pour le moment
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
