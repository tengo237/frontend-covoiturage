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
import * as DocumentPicker from "expo-document-picker";
import AnimatedPressable from "../components/AnimatedPressable";
import { useUser } from "../context/UserContext";

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
  "Véhicule",
  "Photo",
  "Permis",
  "Carte d'identité",
  "Vérification faciale",
  "Récapitulatif",
];

const EMPTY_FORM: FormData = {
  brand: "",
  model: "",
  plate: "",
  color: "",
  seats: "",
  vehiclePhoto: null,
  licenseNumber: "",
  licensePhoto: null,
  idCardPhoto: null,
  facePhoto: null,
};

function StepDashes({ step }: { step: number }) {
  return (
    <View className="flex-row items-center justify-center mb-8 flex-wrap" style={{ gap: 6 }}>
      {STEPS.map((_, i) => (
        <View
          key={i}
          className={i <= step ? "bg-terre-600" : "bg-brun/10"}
          style={{ width: i === step ? 24 : 14, height: 4, borderRadius: 2 }}
        />
      ))}
    </View>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <Text className="font-body-medium text-xs text-brun-muted mb-1.5">{children}</Text>;
}

function TextField(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <View className="mb-4">
      <FieldLabel>{label}</FieldLabel>
      <TextInput
        className="font-body border border-brun/15 rounded-2xl px-4 py-3.5 text-sm text-brun bg-white"
        placeholderTextColor="#8C7A6B80"
        {...rest}
      />
    </View>
  );
}

function PhotoPicker({
  label,
  photo,
  onPick,
  round,
}: {
  label: string;
  photo: string | null;
  onPick: () => void;
  round?: boolean;
}) {
  return (
    <View className="mb-4 items-center">
      <View style={{ width: "100%" }}>
        <FieldLabel>{label}</FieldLabel>
      </View>
      <Pressable
        onPress={onPick}
        className={`border border-dashed border-brun/25 items-center justify-center bg-white overflow-hidden ${
          round ? "rounded-full" : "rounded-2xl w-full"
        }`}
        style={round ? { width: 180, height: 180 } : { height: 180, width: "100%" }}
      >
        {photo ? (
          <Image source={{ uri: photo }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
        ) : (
          <View className="items-center">
            <View className="w-12 h-12 rounded-full bg-teal-50 items-center justify-center mb-2">
              <Ionicons name={round ? "person-outline" : "camera-outline"} size={22} color="#0F6E56" />
            </View>
            <Text className="font-body text-xs text-brun-muted">Ajouter une photo</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

export default function AddVehicle() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const { registerVehicle } = useUser();
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const update = (fields: Partial<FormData>) => setForm((f) => ({ ...f, ...fields }));

  const pickImage = (field: keyof FormData, options?: { frontCamera?: boolean }) => {
    Alert.alert("Ajouter une photo", "Choisissez une source", [
      { text: "Prendre une photo", onPress: () => launchCamera(field, options?.frontCamera) },
      { text: "Choisir dans la galerie", onPress: () => launchLibrary(field) },
      { text: "Parcourir les fichiers", onPress: () => launchFiles(field) },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  const launchCamera = async (field: keyof FormData, frontCamera?: boolean) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "Autorisez l'accès à l'appareil photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
      cameraType: frontCamera ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
    });
    if (!result.canceled) {
      update({ [field]: result.assets[0].uri } as Partial<FormData>);
    }
  };

  const launchLibrary = async (field: keyof FormData) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "Autorisez l'accès à vos photos pour ajouter une image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled) {
      update({ [field]: result.assets[0].uri } as Partial<FormData>);
    }
  };

  const launchFiles = async (field: keyof FormData) => {
    const result = await DocumentPicker.getDocumentAsync({ type: "image/*" });
    if (!result.canceled) {
      update({ [field]: result.assets[0].uri } as Partial<FormData>);
    }
  };

  const fillWithTestData = () => {
    setForm({
      brand: "Toyota",
      model: "Corolla",
      plate: "LT 123 AB",
      color: "Gris",
      seats: "4",
      vehiclePhoto: "https://placehold.co/400x300/D85A30/FBF6EF?text=Véhicule",
      licenseNumber: "0021458CM",
      licensePhoto: "https://placehold.co/400x300/0F6E56/FBF6EF?text=Permis",
      idCardPhoto: "https://placehold.co/400x300/8C7A6B/FBF6EF?text=CNI",
      facePhoto: "https://placehold.co/300x300/D85A30/FBF6EF?text=Selfie",
    });
    setStep(STEPS.length - 1);
  };

  // TODO: réactiver la validation obligatoire une fois le backend branché.
  const isStepValid = () => true;

  const goNext = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };
  const goBack = () => {
    if (step === 0) router.back();
    else setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    registerVehicle({ brand: form.brand, model: form.model, plate: form.plate });
    router.replace("/vehicle-submitted");
  };

  return (
    <SafeAreaView className="flex-1 bg-creme">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 pt-4">
        <View className={`w-full flex-1 ${isTablet ? "max-w-xl self-center" : ""}`}>
          <View className="flex-row items-center justify-between mb-6">
            <Pressable onPress={goBack} hitSlop={10}>
              <Ionicons name="arrow-back" size={22} color="#3D2B1F" />
            </Pressable>
            <Text className="font-body-medium text-xs text-brun-muted">
              Étape {step + 1} / {STEPS.length}
            </Text>
          </View>

          <Pressable onPress={fillWithTestData} className="self-center mb-2">
            <Text className="font-body text-xs text-teal-600 underline">
              🧪 Remplir automatiquement (test)
            </Text>
          </Pressable>

          <StepDashes step={step} />

          {step === 0 && (
            <View>
              <Text className="font-display-bold text-brun text-2xl mb-1">Votre véhicule</Text>
              <Text className="font-body text-brun-muted text-sm mb-6">
                Ces informations apparaîtront sur vos trajets publiés.
              </Text>
              <TextField label="Marque" placeholder="Ex: Toyota" value={form.brand} onChangeText={(v) => update({ brand: v })} />
              <TextField label="Modèle" placeholder="Ex: Corolla" value={form.model} onChangeText={(v) => update({ model: v })} />
              <TextField label="Couleur" placeholder="Ex: Gris" value={form.color} onChangeText={(v) => update({ color: v })} />
              <View className="flex-row" style={{ gap: 12 }}>
                <View className="flex-1">
                  <TextField label="Plaque d'immatriculation" placeholder="LT 123 AB" autoCapitalize="characters" value={form.plate} onChangeText={(v) => update({ plate: v })} />
                </View>
                <View style={{ width: 110 }}>
                  <TextField label="Places" placeholder="4" keyboardType="number-pad" value={form.seats} onChangeText={(v) => update({ seats: v })} />
                </View>
              </View>
            </View>
          )}

          {step === 1 && (
            <View>
              <Text className="font-display-bold text-brun text-2xl mb-1">Photo du véhicule</Text>
              <Text className="font-body text-brun-muted text-sm mb-6">
                Une photo claire de l'extérieur de votre véhicule, plaque visible.
              </Text>
              <PhotoPicker label="Photo du véhicule" photo={form.vehiclePhoto} onPick={() => pickImage("vehiclePhoto")} />
            </View>
          )}

          {step === 2 && (
            <View>
              <Text className="font-display-bold text-brun text-2xl mb-1">Permis de conduire</Text>
              <Text className="font-body text-brun-muted text-sm mb-6">
                Nécessaire pour vérifier votre identité en tant que conducteur.
              </Text>
              <TextField
                label="Numéro de permis"
                placeholder="Ex: 0021458CM"
                autoCapitalize="characters"
                value={form.licenseNumber}
                onChangeText={(v) => update({ licenseNumber: v })}
              />
              <PhotoPicker label="Photo du permis (recto)" photo={form.licensePhoto} onPick={() => pickImage("licensePhoto")} />
            </View>
          )}

          {step === 3 && (
            <View>
              <Text className="font-display-bold text-brun text-2xl mb-1">Carte d'identité</Text>
              <Text className="font-body text-brun-muted text-sm mb-6">
                CNI ou passeport en cours de validité, recto lisible.
              </Text>
              <PhotoPicker label="Photo de la carte d'identité" photo={form.idCardPhoto} onPick={() => pickImage("idCardPhoto")} />
            </View>
          )}

          {step === 4 && (
            <View className="items-center">
              <Text className="font-display-bold text-brun text-2xl mb-1 self-start">
                Vérification faciale
              </Text>
              <Text className="font-body text-brun-muted text-sm mb-6 self-start">
                Un selfie pour confirmer que la carte d'identité vous
                appartient bien. Un administrateur le comparera manuellement.
              </Text>
              <PhotoPicker
                label="Selfie"
                photo={form.facePhoto}
                onPick={() => pickImage("facePhoto", { frontCamera: true })}
                round
              />
              <Text className="font-body text-xs text-brun-muted text-center mt-2 px-4">
                Astuce : utilisez "Prendre une photo" pour ouvrir directement la
                caméra frontale.
              </Text>
            </View>
          )}

          {step === 5 && (
            <View>
              <Text className="font-display-bold text-brun text-2xl mb-1">
                Vérifiez vos informations
              </Text>
              <Text className="font-body text-brun-muted text-sm mb-6">
                Un administrateur pourra valider votre profil conducteur.
              </Text>

              <View className="bg-white border border-brun/10 rounded-2xl p-4 mb-4">
                <Text className="font-body-semibold text-xs text-teal-600 mb-2 uppercase">Véhicule</Text>
                <Text className="font-body text-sm text-brun mb-0.5">
                  {form.brand} {form.model} — {form.color}
                </Text>
                <Text className="font-body text-sm text-brun-muted">
                  {form.plate} · {form.seats} places
                </Text>
              </View>

              <View className="flex-row flex-wrap" style={{ gap: 12 }}>
                {form.vehiclePhoto && <Image source={{ uri: form.vehiclePhoto }} style={{ width: 90, height: 90, borderRadius: 14 }} />}
                {form.licensePhoto && <Image source={{ uri: form.licensePhoto }} style={{ width: 90, height: 90, borderRadius: 14 }} />}
                {form.idCardPhoto && <Image source={{ uri: form.idCardPhoto }} style={{ width: 90, height: 90, borderRadius: 14 }} />}
                {form.facePhoto && <Image source={{ uri: form.facePhoto }} style={{ width: 90, height: 90, borderRadius: 45 }} />}
              </View>

              <View className="bg-white border border-brun/10 rounded-2xl p-4 mt-4 mb-2">
                <Text className="font-body-semibold text-xs text-teal-600 mb-2 uppercase">Permis</Text>
                <Text className="font-body text-sm text-brun">{form.licenseNumber}</Text>
              </View>
            </View>
          )}

          <View style={{ flex: 1 }} />

          <View className="py-6">
            <AnimatedPressable
              onPress={step === STEPS.length - 1 ? handleSubmit : goNext}
              disabled={!isStepValid()}
              className={`rounded-2xl py-4 items-center ${isStepValid() ? "bg-terre-600" : "bg-brun/10"}`}
            >
              <Text className={`font-body-semibold text-base ${isStepValid() ? "text-creme" : "text-brun-muted"}`}>
                {step === STEPS.length - 1 ? "Confirmer et devenir conducteur" : "Continuer"}
              </Text>
            </AnimatedPressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
