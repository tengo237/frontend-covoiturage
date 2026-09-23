import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "../../context/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://12.0.3.9:8000";

interface Review {
  id: number;
  reservation_id: number;
  rating: number;
  comment: string;
  created_at: string;
  passenger: {
    id: number;
    name: string;
    email: string;
    photo_url?: string;
  };
}

interface Stats {
  total_reviews: number;
  average_rating: number;
  ratings_count: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function DriverAvis() {
  const { user, token } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMyReviews();
  }, []);

  // ============================================
  // LOAD MY REVIEWS
  // ============================================

  const loadMyReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const storedToken = token || (await AsyncStorage.getItem("userToken"));

      if (!storedToken) {
        setError("Pas de token");
        return;
      }

      console.log("🔵 Chargement de mes avis...");

      const response = await fetch(`${API_BASE_URL}/api/reviews/my-reviews`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`📩 Status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur");
      }

      const data = await response.json();
      console.log(`✅ ${data.reviews?.length || 0} avis chargés`);

      setReviews(data.reviews || []);
      setStats(data.stats || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur";
      console.error("🔴 Erreur loadMyReviews:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER STAR RATING
  // ============================================

  const renderStars = (rating: number) => {
    return (
      <View style={{ flexDirection: "row", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={16}
            color={star <= rating ? "#FFB800" : "#D1D5DB"}
          />
        ))}
      </View>
    );
  };

  // ============================================
  // RENDER RATING BAR
  // ============================================

  const renderRatingBar = (count: number, rating: number, total: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <View
        key={rating}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 12,
          gap: 8,
        }}
      >
        {/* Stars */}
        <View style={{ width: 40 }}>
          <View style={{ flexDirection: "row", gap: 2 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons
                key={s}
                name={s <= rating ? "star" : "star-outline"}
                size={12}
                color={s <= rating ? "#FFB800" : "#D1D5DB"}
              />
            ))}
          </View>
        </View>

        {/* Bar */}
        <View
          style={{
            flex: 1,
            height: 8,
            backgroundColor: "#E5E7EB",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${percentage}%`,
              backgroundColor: "#10B981",
            }}
          />
        </View>

        {/* Count */}
        <Text style={{ fontSize: 12, color: "#9CA3AF", width: 30, textAlign: "right" }}>
          {count}
        </Text>
      </View>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FBF6EF", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#D85A30" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FBF6EF" }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        
        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: "800", color: "#1F2937", marginBottom: 4 }}>
          Mes avis
        </Text>
        <Text style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 24 }}>
          Retrouvez tous les avis que vous avez reçus
        </Text>

        {error && (
          <View
            style={{
              backgroundColor: "#FEE2E4",
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
              borderLeftWidth: 4,
              borderLeftColor: "#DC2626",
            }}
          >
            <Text style={{ fontSize: 13, color: "#DC2626" }}>{error}</Text>
          </View>
        )}

        {/* Stats Card */}
        {stats && (
          <View
            style={{
              backgroundColor: "#FFF",
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: "#E8D5C4",
              marginBottom: 24,
            }}
          >
            {/* Average Rating */}
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 40, fontWeight: "800", color: "#FFB800" }}>
                {stats.average_rating}
              </Text>
              <View style={{ marginTop: 8 }}>
                {renderStars(Math.round(stats.average_rating))}
              </View>
              <Text style={{ fontSize: 12, color: "#9CA3AF", marginTop: 8 }}>
                {stats.total_reviews} avis
              </Text>
            </View>

            {/* Rating Distribution */}
            <View style={{ borderTopWidth: 1, borderTopColor: "#E8D5C4", paddingTop: 16 }}>
              {[5, 4, 3, 2, 1].map((rating) =>
                renderRatingBar(
                  stats.ratings_count[rating as keyof typeof stats.ratings_count],
                  rating,
                  stats.total_reviews
                )
              )}
            </View>
          </View>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 40 }}>
            <Ionicons name="star-outline" size={48} color="#D1D5DB" />
            <Text style={{ fontSize: 14, color: "#9CA3AF", marginTop: 16, textAlign: "center" }}>
              Vous n'avez pas encore d'avis.
            </Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View
              key={review.id}
              style={{
                backgroundColor: "#FFF",
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: "#E8D5C4",
                marginBottom: 12,
              }}
            >
              {/* Header: Passenger + Rating */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                  {/* Avatar */}
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: "#DCFCE7",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Ionicons name="person" size={20} color="#0F6E56" />
                  </View>

                  {/* Name + Date */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", fontSize: 14, color: "#1F2937" }}>
                      {review.passenger.name}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                      {new Date(review.created_at).toLocaleDateString("fr-FR")}
                    </Text>
                  </View>
                </View>

                {/* Stars */}
                <View>{renderStars(review.rating)}</View>
              </View>

              {/* Comment */}
              {review.comment && (
                <Text style={{ fontSize: 13, color: "#4B5563", lineHeight: 20, fontStyle: "italic" }}>
                  "{review.comment}"
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
