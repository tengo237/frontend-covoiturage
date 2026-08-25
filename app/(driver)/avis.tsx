import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MY_REVIEWS, averageRating } from "../../lib/driverTrips";

function Stars({ rating }: { rating: number }) {
  return (
    <View className="flex-row" style={{ gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons key={i} name={i < rating ? "star" : "star-outline"} size={13} color="#D85A30" />
      ))}
    </View>
  );
}

export default function DriverReviews() {
  const avg = averageRating();

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-4">
        <Text className="font-display-bold text-brun text-2xl mb-6">Avis reçus</Text>

        <View className="bg-white border border-brun/10 rounded-2xl p-5 items-center mb-6">
          <Text className="font-display-bold text-brun text-3xl mb-1">{avg}</Text>
          <Stars rating={Math.round(avg)} />
          <Text className="font-body text-xs text-brun-muted mt-2">
            Basé sur {MY_REVIEWS.length} avis
          </Text>
        </View>

        {MY_REVIEWS.map((review) => (
          <View key={review.id} className="bg-white border border-brun/10 rounded-2xl p-4 mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="font-body-semibold text-sm text-brun">{review.passengerName}</Text>
              <Text className="font-body text-xs text-brun-muted">{review.date}</Text>
            </View>
            <Stars rating={review.rating} />
            <Text className="font-body text-sm text-brun-muted mt-2 leading-5">{review.comment}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
