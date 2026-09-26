import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../context/UserContext';

const API_BASE_URL = 'http://12.0.3.9:8000';

export default function PaymentSettingsScreen() {
  const router = useRouter();
  const { token, user } = useUser();

  const [step, setStep] = useState<'method' | 'payment' | 'processing' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<'orange_money' | 'mtn_momo' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));

  // ============================================
  // ÉTAPE 1: Choisir la méthode
  // ============================================

  const selectMethod = (method: 'orange_money' | 'mtn_momo') => {
    setSelectedMethod(method);
    setStep('payment');
    setPhoneNumber('');
    setAmount('');
  };

  // ============================================
  // ÉTAPE 2: Valider et payer
  // ============================================

  const handlePay = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('❌ Erreur', 'Entrez votre numéro de téléphone');
      return;
    }

    if (!amount.trim()) {
      Alert.alert('❌ Erreur', 'Entrez la somme à payer');
      return;
    }

    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    if (cleanPhone.length < 9) {
      Alert.alert('❌ Erreur', 'Numéro invalide');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('❌ Erreur', 'Montant invalide');
      return;
    }

    try {
      setLoading(true);
      setStep('processing');

      // Simulation paiement
      await new Promise(resolve => setTimeout(resolve, 3000));

      setStep('success');
      
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();

      // Auto-redirect après 3 secondes
      setTimeout(() => {
        router.back();
      }, 3000);
    } catch (error) {
      Alert.alert('❌ Erreur', 'Paiement échoué');
      setStep('payment');
      setLoading(false);
    }
  };

  // ============================================
  // RENDER - ÉTAPE 1: Choisir la méthode
  // ============================================

  if (step === 'method') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
          {/* Header */}
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
            <Ionicons name="chevron-back" size={28} color="#1F2937" />
          </TouchableOpacity>

          <Text style={{ fontSize: 32, fontWeight: '800', color: '#1F2937', marginBottom: 8 }}>
            💳 Paiement
          </Text>
          <Text style={{ fontSize: 16, color: '#9CA3AF', marginBottom: 32 }}>
            Choisissez votre mode de paiement
          </Text>

          {/* ORANGE MONEY */}
          <TouchableOpacity
            onPress={() => selectMethod('orange_money')}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#FF6600',
              borderRadius: 20,
              padding: 28,
              marginBottom: 16,
              elevation: 8,
              shadowColor: '#FF6600',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 60, marginBottom: 12 }}>🟠</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 6 }}>
                Orange Money
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
                Paiement rapide et sécurisé
              </Text>
              <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="shield-checkmark" size={16} color="#FFF" />
                <Text style={{ color: '#FFF', fontSize: 11, marginLeft: 6 }}>100% Sécurisé</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* MTN MOBILE MONEY */}
          <TouchableOpacity
            onPress={() => selectMethod('mtn_momo')}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#FFCC00',
              borderRadius: 20,
              padding: 28,
              marginBottom: 16,
              elevation: 8,
              shadowColor: '#FFCC00',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 60, marginBottom: 12 }}>🟡</Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#1F2937', marginBottom: 6 }}>
                MTN Mobile Money
              </Text>
              <Text style={{ fontSize: 13, color: '#4B5563', textAlign: 'center' }}>
                Paiement rapide et sécurisé
              </Text>
              <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="shield-checkmark" size={16} color="#1F2937" />
                <Text style={{ color: '#1F2937', fontSize: 11, marginLeft: 6 }}>100% Sécurisé</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Info Footer */}
          <View style={{ marginTop: 32, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#E8D5C4' }}>
            <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', lineHeight: 18 }}>
              Pas de compte? Créez-en un gratuitement avec Orange Money ou MTN Mobile Money
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER - ÉTAPE 2: Numéro + Somme + PAYER
  // ============================================

  if (step === 'payment') {
    const isOrange = selectedMethod === 'orange_money';
    const bgColor = isOrange ? '#FF6600' : '#FFCC00';
    const textColor = isOrange ? '#FFF' : '#1F2937';
    const placeholderPhone = isOrange ? '+237650123456' : '+237670123456';

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingVertical: 24 }}>
            {/* Header */}
            <TouchableOpacity onPress={() => setStep('method')} style={{ marginBottom: 20 }}>
              <Ionicons name="chevron-back" size={28} color="#1F2937" />
            </TouchableOpacity>

            {/* Card principal */}
            <View
              style={{
                backgroundColor: bgColor,
                borderRadius: 24,
                padding: 28,
                marginBottom: 32,
                elevation: 8,
                shadowColor: bgColor,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
              }}
            >
              <Text style={{ fontSize: 16, color: textColor, opacity: 0.8, marginBottom: 12 }}>
                {isOrange ? '🟠 Orange Money' : '🟡 MTN Mobile Money'}
              </Text>
              
              <Text style={{ fontSize: 28, fontWeight: '800', color: textColor, marginBottom: 4 }}>
                Effectuer un paiement
              </Text>
              <Text style={{ fontSize: 13, color: textColor, opacity: 0.8 }}>
                Remplissez les informations ci-dessous
              </Text>
            </View>

            {/* ========== INPUT NUMÉRO ========== */}
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 10 }}>
              📱 Numéro de téléphone
            </Text>

            <TextInput
              style={{
                borderWidth: 2,
                borderColor: bgColor,
                borderRadius: 16,
                paddingHorizontal: 18,
                paddingVertical: 14,
                fontSize: 16,
                color: '#1F2937',
                backgroundColor: '#FFF',
                marginBottom: 20,
                fontWeight: '600',
              }}
              placeholder={placeholderPhone}
              placeholderTextColor="#D1D5DB"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              editable={!loading}
            />

            {/* Info Format */}
            <View
              style={{
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderRadius: 12,
                padding: 10,
                marginBottom: 24,
                flexDirection: 'row',
              }}
            >
              <Ionicons name="information-circle" size={16} color="#6B7280" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 11, color: '#6B7280', flex: 1, lineHeight: 16 }}>
                Format: +237650123456 ou 237650123456
              </Text>
            </View>

            {/* ========== INPUT SOMME ========== */}
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 10 }}>
              💰 Somme à payer
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 2,
                borderColor: bgColor,
                borderRadius: 16,
                backgroundColor: '#FFF',
                marginBottom: 28,
                paddingRight: 16,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: '#1F2937',
                  fontWeight: '600',
                }}
                placeholder="Exemple: 4000"
                placeholderTextColor="#D1D5DB"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                editable={!loading}
              />
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#9CA3AF' }}>
                FCFA
              </Text>
            </View>

            {/* ========== BOUTON PAYER ========== */}
            <TouchableOpacity
              onPress={handlePay}
              disabled={loading}
              activeOpacity={0.8}
              style={{
                backgroundColor: bgColor,
                borderRadius: 16,
                paddingVertical: 18,
                alignItems: 'center',
                marginBottom: 16,
                elevation: 8,
                shadowColor: bgColor,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 10,
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator size="large" color={textColor} />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="card" size={20} color={textColor} />
                  <Text style={{ color: textColor, fontWeight: '800', fontSize: 18, marginLeft: 10 }}>
                    Payer
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Bouton Retour */}
            <TouchableOpacity
              onPress={() => setStep('method')}
              disabled={loading}
              style={{
                backgroundColor: '#F3F4F6',
                borderRadius: 16,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#6B7280', fontWeight: '700', fontSize: 16 }}>
                Retour
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER - ÉTAPE 3: En cours de paiement
  // ============================================

  if (step === 'processing') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: 'rgba(216, 90, 48, 0.1)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <ActivityIndicator size="large" color="#D85A30" />
          </View>

          <Text style={{ fontSize: 22, fontWeight: '800', color: '#1F2937', marginBottom: 8, textAlign: 'center' }}>
            Traitement du paiement...
          </Text>
          <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center' }}>
            Veuillez patienter quelques secondes
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER - ÉTAPE 4: SUCCÈS!
  // ============================================

  if (step === 'success') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            alignItems: 'center',
          }}
        >
          {/* Checkmark */}
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#10B981',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 50 }}>✓</Text>
          </View>

          {/* Message */}
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#1F2937', marginBottom: 12, textAlign: 'center' }}>
            Paiement effectué
            avec succès! 🎉
          </Text>

          <Text style={{ fontSize: 16, color: '#9CA3AF', textAlign: 'center', marginBottom: 8 }}>
            Votre transaction a été approuvée
          </Text>

          <Text style={{ fontSize: 14, color: '#D85A30', fontWeight: '700', textAlign: 'center' }}>
            Montant payé: {amount} FCFA
          </Text>

          {/* Auto-redirect message */}
          <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 24, textAlign: 'center' }}>
            Redirection automatique...
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return null;
}
