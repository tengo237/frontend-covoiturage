import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUser } from '../../context/UserContext';

const API_BASE_URL = 'http://12.0.3.9:8000';

const getImageUrl = (photoUrl: string | null | undefined): string => {
  if (!photoUrl) return 'https://via.placeholder.com/200?text=Pas+de+photo';
  if (photoUrl.startsWith('http')) return photoUrl;
  return `${API_BASE_URL}${photoUrl}`;
};

// ✅ FONCTION DE FORMAT PRIX EN CFA
const formatPrice = (price: number) => {
  if (!price) return '0 CFA';
  return `${Math.round(price).toLocaleString('fr-CM')} CFA`;
};

export default function Accueil() {
  const { user, token } = useUser();
  const [trips, setTrips] = useState<any[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reserving, setReserving] = useState<number | null>(null);

  // Filtres
  const [searchDepart, setSearchDepart] = useState('');
  const [searchArrivee, setSearchArrivee] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadTrips();
  }, [token]);

  // Filtrer en temps réel
  useEffect(() => {
    filterTrips();
  }, [searchDepart, searchArrivee, selectedDate, selectedTime, trips]);

  const loadTrips = async () => {
    try {
      setLoading(true);
      console.log('🔵 Chargement des trajets...');

      if (!token) {
        console.log('❌ Pas de token');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/trips/available`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📩 Status:', response.status);

      if (!response.ok) throw new Error('Erreur chargement');

      const data = await response.json();
      console.log('🟢 Trajets chargés:', data.trips?.length || 0);

      setTrips(data.trips || []);
      setFilteredTrips(data.trips || []);
    } catch (error) {
      console.error('🔴 Erreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les trajets');
    } finally {
      setLoading(false);
    }
  };

  const filterTrips = () => {
    let filtered = trips;

    // Filtrer par départ
    if (searchDepart) {
      filtered = filtered.filter((trip) =>
        trip.departure_location?.toLowerCase().includes(searchDepart.toLowerCase())
      );
    }

    // Filtrer par arrivée
    if (searchArrivee) {
      filtered = filtered.filter((trip) =>
        trip.arrival_location?.toLowerCase().includes(searchArrivee.toLowerCase())
      );
    }

    // Filtrer par date
    if (selectedDate) {
      const filterDateStr = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter((trip) => {
        if (!trip.departure_time) return false;
        const tripDateStr = trip.departure_time.split('T')[0];
        return tripDateStr === filterDateStr;
      });
    }

    // Filtrer par heure (optionnel - trajets après l'heure sélectionnée)
    if (selectedTime && selectedDate) {
      const selectedHour = selectedTime.getHours();
      filtered = filtered.filter((trip) => {
        if (!trip.departure_time) return false;
        const tripHour = new Date(trip.departure_time).getHours();
        return tripHour >= selectedHour;
      });
    }

    console.log('🔍 Trajets filtrés:', filtered.length);
    setFilteredTrips(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  };

  // Gestion DatePicker
  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  // Gestion TimePicker
  const handleTimeChange = (event: any, time?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (time) {
      setSelectedTime(time);
    }
  };

  // Format date pour affichage
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time pour affichage
  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Réserver
  const handleReserver = async (tripId: number) => {
    try {
      setReserving(tripId);
      console.log('📌 Tentative de réservation pour trip:', tripId);

      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          trip_id: tripId,
          number_of_seats: 1,
        }),
      });

      console.log('📩 Réponse réservation:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur réservation');
      }

      const data = await response.json();
      console.log('✅ Réservation réussie!', data);

      Alert.alert('✅ Succès!', 'Votre réservation a été confirmée');
      loadTrips();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur';
      console.error('🔴 Erreur réservation:', message);
      Alert.alert('❌ Erreur', message);
    } finally {
      setReserving(null);
    }
  };

  const renderTrip = ({ item }: any) => (
    <View
      style={{
        marginBottom: 16,
        marginHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      }}
    >
      {/* Image Véhicule */}
      <View style={{ position: 'relative' }}>
        {item.vehicle?.photo_url ? (
          <Image
            source={{ uri: getImageUrl(item.vehicle.photo_url) }}
            style={{ width: '100%', height: 200, backgroundColor: '#e5e7eb' }}
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: 200,
              backgroundColor: '#e5e7eb',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="car-sport" size={48} color="#9ca3af" />
            <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>
              Photo indisponible
            </Text>
          </View>
        )}

        {/* Badge Places */}
        <View
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: '#D85A30',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="people" size={14} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', marginLeft: 6 }}>
            {item.available_seats} places
          </Text>
        </View>

        {/* Prix Badge - ✅ AFFICHER EN CFA */}
        <View
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            backgroundColor: '#fff',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#D85A30' }}>
            {formatPrice(item.price_per_seat)}
          </Text>
          <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>
            /personne
          </Text>
        </View>
      </View>

      {/* Infos Conducteur */}
      <View style={{ padding: 14 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
          }}
        >
          <Image
            source={{ uri: getImageUrl(item.driver?.photo_url) }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#f0f0f0',
              borderWidth: 2,
              borderColor: '#D85A30',
            }}
          />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#1f2937' }}>
              {item.driver?.name || 'Conducteur'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFB800', marginLeft: 4 }}>
                4.8
              </Text>
            </View>
          </View>
        </View>

        {/* Timeline Trajet */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ alignItems: 'center', marginRight: 12 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#D85A30',
                }}
              />
              <View
                style={{
                  width: 2,
                  height: 40,
                  backgroundColor: '#E8D5C4',
                  marginVertical: 4,
                }}
              />
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#378ADD',
                }}
              />
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ marginBottom: 40 }}>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '500' }}>
                  DÉPART
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: '#1f2937',
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  {item.departure_location}
                </Text>
              </View>

              <View>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '500' }}>
                  ARRIVÉE
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: '#1f2937',
                    marginTop: 2,
                  }}
                  numberOfLines={1}
                >
                  {item.arrival_location}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Infos Rapides */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: '#F0F9FF',
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 10,
              marginRight: 6,
              alignItems: 'center',
            }}
          >
            <Ionicons name="calendar" size={16} color="#378ADD" />
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#378ADD', marginTop: 4 }}>
              {item.departure_time?.split(' ')[0] || 'N/A'}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: '#FFF5E6',
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 10,
              marginRight: 6,
              alignItems: 'center',
            }}
          >
            <Ionicons name="time" size={16} color="#F59E0B" />
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#F59E0B', marginTop: 4 }}>
              {item.departure_time?.split(' ')[1] || 'N/A'}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: '#F0FDF4',
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={{ fontSize: 10, fontWeight: '600', color: '#10b981', marginTop: 4 }}>
              Actif
            </Text>
          </View>
        </View>

        {/* Bouton Réserver */}
        <TouchableOpacity
          onPress={() => handleReserver(item.id)}
          disabled={reserving === item.id}
          style={{
            backgroundColor: reserving === item.id ? '#B8481F' : '#D85A30',
            paddingVertical: 14,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            borderRadius: 12,
            opacity: reserving === item.id ? 0.7 : 1,
          }}
        >
          {reserving === item.id ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginLeft: 8 }}>
                Réservation...
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginLeft: 8 }}>
                Réserver ce trajet
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && trips.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FBF6EF',
        }}
      >
        <ActivityIndicator size="large" color="#D85A30" />
        <Text style={{ marginTop: 16, color: '#9ca3af', fontSize: 14 }}>
          Chargement des trajets...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#1f2937', marginBottom: 4 }}>
          Bonjour! 👋
        </Text>
        <Text style={{ fontSize: 14, color: '#9ca3af' }}>
          {filteredTrips.length} trajet{filteredTrips.length > 1 ? 's' : ''} trouvé{filteredTrips.length > 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={filteredTrips}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        scrollEnabled={true}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 12, marginBottom: 16 }}>
            {/* Titre Formulaire */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: 12,
                marginLeft: 4,
              }}
            >
              🔍 Rechercher un trajet
            </Text>

            {/* Champ Départ */}
            <TextInput
              placeholder="Lieu de départ..."
              value={searchDepart}
              onChangeText={setSearchDepart}
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: '#E8D5C4',
                fontSize: 14,
                color: '#1f2937',
              }}
              placeholderTextColor="#9ca3af"
            />

            {/* Champ Arrivée */}
            <TextInput
              placeholder="Lieu d'arrivée..."
              value={searchArrivee}
              onChangeText={setSearchArrivee}
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: '#E8D5C4',
                fontSize: 14,
                color: '#1f2937',
              }}
              placeholderTextColor="#9ca3af"
            />

            {/* Champ Date - DatePicker */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: '#E8D5C4',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: selectedDate ? '#1f2937' : '#9ca3af',
                  fontWeight: '500',
                }}
              >
                {selectedDate ? formatDate(selectedDate) : 'Choisir une date...'}
              </Text>
              <Ionicons name="calendar" size={20} color="#D85A30" />
            </TouchableOpacity>

            {/* Champ Heure - TimePicker */}
            {selectedDate && (
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: '#E8D5C4',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: selectedTime ? '#1f2937' : '#9ca3af',
                    fontWeight: '500',
                  }}
                >
                  {selectedTime ? formatTime(selectedTime) : 'Choisir une heure...'}
                </Text>
                <Ionicons name="time" size={20} color="#D85A30" />
              </TouchableOpacity>
            )}

            {/* Bouton Réinitialiser Filtre */}
            {(selectedDate || selectedTime || searchDepart || searchArrivee) && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedDate(null);
                  setSelectedTime(null);
                  setSearchDepart('');
                  setSearchArrivee('');
                }}
                style={{
                  backgroundColor: '#f0f0f0',
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: 'center',
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: '#D85A30', fontWeight: '600' }}>
                  ✕ Réinitialiser les filtres
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="search-outline" size={56} color="#D1D5DB" />
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#6b7280', marginTop: 16 }}>
              Aucun trajet trouvé
            </Text>
            <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
              Essayez de modifier vos critères de recherche
            </Text>
          </View>
        }
      />

      {/* DatePicker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {/* TimePicker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={selectedTime || new Date()}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}
