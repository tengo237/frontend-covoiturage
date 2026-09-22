import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../context/UserContext';

const API_BASE_URL = 'http://12.0.3.9:8000';

type FormData = {
  brand: string;
  model: string;
  plate: string;
  color: string;
  seats: string;
  vehiclePhoto: string | null;
  licenseNumber: string;
  licensePhoto: string | null;
  idCardPhoto: string | null;
  facePhoto: string | null;
};

const STEPS = [
  'Vehicule',
  'Photo Vehicule',
  'Permis',
  'Carte d identite',
  'Verification faciale',
  'Recapitulatif',
];

const EMPTY_FORM: FormData = {
  brand: '',
  model: '',
  plate: '',
  color: '',
  seats: '',
  vehiclePhoto: null,
  licenseNumber: '',
  licensePhoto: null,
  idCardPhoto: null,
  facePhoto: null,
};

export default function AddVehicle() {
  const router = useRouter();
  const { token } = useUser();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const update = (fields: Partial<FormData>) =>
    setForm((f) => ({ ...f, ...fields }));

  // ============================================
  // IMAGE PICKER FUNCTIONS
  // ============================================

  const pickImage = async (
    field: keyof FormData,
    options?: { frontCamera?: boolean }
  ) => {
    Alert.alert('Ajouter une photo', 'Choisissez une source', [
      {
        text: 'Prendre une photo',
        onPress: () => launchCamera(field, options?.frontCamera),
      },
      { text: 'Galerie', onPress: () => launchLibrary(field) },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const launchCamera = async (field: keyof FormData, frontCamera?: boolean) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Autorisez l acces a l appareil photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
      cameraType: frontCamera
        ? ImagePicker.CameraType.front
        : ImagePicker.CameraType.back,
    });
    if (!result.canceled) {
      update({ [field]: result.assets[0].uri } as Partial<FormData>);
    }
  };

  const launchLibrary = async (field: keyof FormData) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Autorisez l acces a vos photos.'
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled) {
      update({ [field]: result.assets[0].uri } as Partial<FormData>);
    }
  };

  // ============================================
  // FILL TEST DATA
  // ============================================

  const fillWithTestData = () => {
    setForm({
      brand: 'Toyota',
      model: 'Corolla',
      plate: 'LT 123 AB',
      color: 'Gris',
      seats: '4',
      vehiclePhoto:
        'https://via.placeholder.com/400x300/D85A30/FBF6EF?text=Vehicule',
      licenseNumber: '0021458CM',
      licensePhoto:
        'https://via.placeholder.com/400x300/0F6E56/FBF6EF?text=Permis',
      idCardPhoto:
        'https://via.placeholder.com/400x300/8C7A6B/FBF6EF?text=CNI',
      facePhoto:
        'https://via.placeholder.com/300x300/D85A30/FBF6EF?text=Selfie',
    });
    setStep(STEPS.length - 1);
  };

  // ============================================
  // VALIDATION
  // ============================================

  const isStepValid = (): boolean => {
    switch (step) {
      case 0:
        return (
          form.brand.trim() !== '' &&
          form.model.trim() !== '' &&
          form.plate.trim() !== ''
        );
      case 1:
        return form.vehiclePhoto !== null;
      case 2:
        return (
          form.licenseNumber.trim() !== '' && form.licensePhoto !== null
        );
      case 3:
        return form.idCardPhoto !== null;
      case 4:
        return form.facePhoto !== null;
      case 5:
        return true;
      default:
        return false;
    }
  };

  // ============================================
  // SUBMIT
  // ============================================

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Erreur', 'Vous devez etre connecte');
      return;
    }

    if (!form.brand || !form.model || !form.plate || !form.vehiclePhoto) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setSubmitting(true);
      console.log('[VEHICLE] Submission...');

      const formDataObj = new FormData();
      formDataObj.append('brand', form.brand);
      formDataObj.append('model', form.model);
      formDataObj.append('color', form.color);
      formDataObj.append('plate', form.plate);

      // Ajouter la photo du vehicule
      if (form.vehiclePhoto) {
        const photoFile = {
          uri: form.vehiclePhoto,
          type: 'image/jpeg',
          name: 'vehicle.jpg',
        };
        formDataObj.append('photo', photoFile as any);
        console.log('[VEHICLE] Photo ajoutee au FormData');
      }

      const url = `${API_BASE_URL}/api/vehicles`;
      console.log('[VEHICLE] Envoi a:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataObj,
      });

      console.log('[VEHICLE] Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erreur creation');
      }

      const data = await response.json();
      console.log('[VEHICLE] OK - Vehicule cree:', data);
      console.log('[VEHICLE] Photo URL:', data.vehicle?.photo_url);

      Alert.alert(
        'Succes!',
        'Votre vehicule a ete ajoute avec succes!\n\nVous etes maintenant conducteur. Les autres informations seront verifiees par un administrateur.',
        [
          {
            text: 'Continuer',
            onPress: () => {
              setForm(EMPTY_FORM);
              setStep(0);
              router.replace('/(tabs)/profil');
            },
          },
        ]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('[VEHICLE] ERREUR:', message);
      Alert.alert('Erreur', message);
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // NAVIGATION
  // ============================================

  const goNext = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step === 0) router.back();
    else setStep((s) => s - 1);
  };

  // ============================================
  // STEP DASHES
  // ============================================

  const StepDashes = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        gap: 6,
        flexWrap: 'wrap',
      }}
    >
      {STEPS.map((_, i) => (
        <View
          key={i}
          style={{
            width: i === step ? 24 : 14,
            height: 4,
            borderRadius: 2,
            backgroundColor: i <= step ? '#D85A30' : '#E8D5C4',
          }}
        />
      ))}
    </View>
  );

  // ============================================
  // COMPONENTS
  // ============================================

  const FieldLabel = ({ children }: { children: string }) => (
    <Text style={{ fontSize: 12, fontWeight: '500', color: '#9ca3af', marginBottom: 6 }}>
      {children}
    </Text>
  );

  const TextField = (
    props: React.ComponentProps<typeof TextInput> & { label: string }
  ) => {
    const { label, ...rest } = props;
    return (
      <View style={{ marginBottom: 16 }}>
        <FieldLabel>{label}</FieldLabel>
        <TextInput
          style={{
            backgroundColor: '#fff',
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 14,
            color: '#1f2937',
            borderWidth: 1,
            borderColor: '#E8D5C4',
          }}
          placeholderTextColor="#9ca3af"
          {...rest}
        />
      </View>
    );
  };

  const PhotoPicker = ({
    label,
    photo,
    onPick,
    round,
  }: {
    label: string;
    photo: string | null;
    onPick: () => void;
    round?: boolean;
  }) => (
    <View style={{ marginBottom: 16 }}>
      <FieldLabel>{label}</FieldLabel>
      <TouchableOpacity
        onPress={onPick}
        style={{
          backgroundColor: '#fff',
          borderRadius: round ? 90 : 10,
          borderWidth: 2,
          borderStyle: 'dashed',
          borderColor: '#E8D5C4',
          alignItems: 'center',
          justifyContent: 'center',
          width: round ? 180 : '100%',
          height: round ? 180 : 180,
          alignSelf: round ? 'center' : 'auto',
          overflow: 'hidden',
        }}
      >
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: round ? 90 : 8,
            }}
          />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#FEE8E0',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <Ionicons
                name={round ? 'person-outline' : 'camera-outline'}
                size={22}
                color="#D85A30"
              />
            </View>
            <Text style={{ fontSize: 12, color: '#9ca3af', fontWeight: '500' }}>
              Ajouter une photo
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EF' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <TouchableOpacity onPress={goBack}>
            <Ionicons name="chevron-back" size={28} color="#1f2937" />
          </TouchableOpacity>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#9ca3af' }}>
            Etape {step + 1} / {STEPS.length}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Test Data Button */}
        <TouchableOpacity
          onPress={fillWithTestData}
          style={{ alignSelf: 'center', marginBottom: 16 }}
        >
          <Text style={{ fontSize: 11, color: '#D85A30', fontWeight: '600', textDecorationLine: 'underline' }}>
            Remplir avec donnees test
          </Text>
        </TouchableOpacity>

        {/* Step Indicator */}
        <StepDashes />

        {/* Step Content */}
        {step === 0 && (
          <View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937', marginBottom: 8 }}>
              Votre Vehicule
            </Text>
            <Text style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>
              Ces informations apparaitront sur vos trajets publies.
            </Text>

            <TextField
              label="Marque"
              placeholder="Ex: Toyota"
              value={form.brand}
              onChangeText={(v) => update({ brand: v })}
            />
            <TextField
              label="Modele"
              placeholder="Ex: Corolla"
              value={form.model}
              onChangeText={(v) => update({ model: v })}
            />
            <TextField
              label="Couleur"
              placeholder="Ex: Gris"
              value={form.color}
              onChangeText={(v) => update({ color: v })}
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <TextField
                  label="Plaque d immatriculation"
                  placeholder="LT 123 AB"
                  autoCapitalize="characters"
                  value={form.plate}
                  onChangeText={(v) => update({ plate: v })}
                />
              </View>
              <View style={{ width: 100 }}>
                <TextField
                  label="Places"
                  placeholder="4"
                  keyboardType="number-pad"
                  value={form.seats}
                  onChangeText={(v) => update({ seats: v })}
                />
              </View>
            </View>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937', marginBottom: 8 }}>
              Photo du Vehicule
            </Text>
            <Text style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>
              Une photo claire de l exterieur, plaque visible.
            </Text>
            <PhotoPicker
              label="Photo du vehicule"
              photo={form.vehiclePhoto}
              onPick={() => pickImage('vehiclePhoto')}
            />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937', marginBottom: 8 }}>
              Permis de Conduire
            </Text>
            <Text style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>
              Necessaire pour verifier votre identite.
            </Text>
            <TextField
              label="Numero de permis"
              placeholder="Ex: 0021458CM"
              autoCapitalize="characters"
              value={form.licenseNumber}
              onChangeText={(v) => update({ licenseNumber: v })}
            />
            <PhotoPicker
              label="Photo du permis (recto)"
              photo={form.licensePhoto}
              onPick={() => pickImage('licensePhoto')}
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937', marginBottom: 8 }}>
              Carte d Identite
            </Text>
            <Text style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>
              CNI ou passeport en cours de validite, recto lisible.
            </Text>
            <PhotoPicker
              label="Photo de la CNI"
              photo={form.idCardPhoto}
              onPick={() => pickImage('idCardPhoto')}
            />
          </View>
        )}

        {step === 4 && (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937', marginBottom: 8, alignSelf: 'flex-start' }}>
              Verification Faciale
            </Text>
            <Text style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24, alignSelf: 'flex-start' }}>
              Un selfie pour confirmer que la carte vous appartient. Un admin le comparera manuellement.
            </Text>
            <PhotoPicker
              label="Selfie"
              photo={form.facePhoto}
              onPick={() => pickImage('facePhoto', { frontCamera: true })}
              round
            />
            <Text style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 12 }}>
              Conseil: "Prendre une photo" pour la camera frontale
            </Text>
          </View>
        )}

        {step === 5 && (
          <View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937', marginBottom: 8 }}>
              Verifiez Vos Infos
            </Text>
            <Text style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>
              Un administrateur validera votre profil conducteur.
            </Text>

            {/* Vehicle Summary */}
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#E8D5C4',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#D85A30', marginBottom: 12, textTransform: 'uppercase' }}>
                Vehicule
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 4 }}>
                {form.brand} {form.model} — {form.color}
              </Text>
              <Text style={{ fontSize: 13, color: '#9ca3af' }}>
                {form.plate} · {form.seats} places
              </Text>
            </View>

            {/* Photos Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              {form.vehiclePhoto && (
                <Image
                  source={{ uri: form.vehiclePhoto }}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 10,
                    backgroundColor: '#f0f0f0',
                  }}
                />
              )}
              {form.licensePhoto && (
                <Image
                  source={{ uri: form.licensePhoto }}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 10,
                    backgroundColor: '#f0f0f0',
                  }}
                />
              )}
              {form.idCardPhoto && (
                <Image
                  source={{ uri: form.idCardPhoto }}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 10,
                    backgroundColor: '#f0f0f0',
                  }}
                />
              )}
              {form.facePhoto && (
                <Image
                  source={{ uri: form.facePhoto }}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 45,
                    backgroundColor: '#f0f0f0',
                  }}
                />
              )}
            </View>

            {/* License Summary */}
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: '#E8D5C4',
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#D85A30', marginBottom: 12, textTransform: 'uppercase' }}>
                Permis
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1f2937' }}>
                {form.licenseNumber}
              </Text>
            </View>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={{ marginTop: 32, marginBottom: 16, gap: 12 }}>
          <TouchableOpacity
            onPress={step === STEPS.length - 1 ? handleSubmit : goNext}
            disabled={!isStepValid() || submitting}
            style={{
              backgroundColor: isStepValid() ? '#D85A30' : '#d1d5db',
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: 'center',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                {step === STEPS.length - 1
                  ? 'Confirmer et Devenir Conducteur'
                  : 'Continuer'}
              </Text>
            )}
          </TouchableOpacity>

          {step > 0 && (
            <TouchableOpacity
              onPress={goBack}
              style={{
                backgroundColor: '#f0f0f0',
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#1f2937', fontWeight: '600', fontSize: 14 }}>
                Retour
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}