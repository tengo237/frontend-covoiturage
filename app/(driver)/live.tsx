// app/(driver)/live.tsx - Avec capture de frames
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSleepDetection } from '../../hooks/useSleepDetection';

export default function LiveScreen() {
  console.log('[📺 LIVE] Component mounted');

  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('idle');
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { state, stopAlarm, startMonitoring, stopMonitoring, isMonitoring, analyzeFace } =
    useSleepDetection();

  // Demander permission
  useEffect(() => {
    const checkPermission = async () => {
      if (!permission) {
        const result = await requestPermission();
        console.log('[LIVE] Camera permission:', result?.granted);
      }
    };
    checkPermission();
  }, [permission, requestPermission]);

  // Cleanup
  useEffect(() => {
    return () => {
      console.log('[LIVE] Unmounting');
      if (isRecording) {
        stopMonitoring();
      }
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, [isRecording, stopMonitoring]);

  // Capturer et analyser les frames
  const startFrameCapture = async () => {
    console.log('[LIVE] Starting frame capture...');

    if (!cameraRef.current) {
      console.error('[LIVE] Camera ref not available');
      return;
    }

    captureIntervalRef.current = setInterval(async () => {
      if (isRecording && cameraRef.current) {
        try {
          console.log('[LIVE] Capturing frame...');
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.7,
            base64: false,
          });

          if (photo) {
            console.log('[LIVE] Frame captured:', photo.uri);
            setAnalysisStatus('analyzing');
            await analyzeFace(photo.uri);
            setAnalysisStatus('done');
          }
        } catch (error) {
          console.error('[LIVE] Frame capture error:', error);
          setAnalysisStatus('error');
        }
      }
    }, 1000); // Capturer chaque seconde
  };

  // Toggle recording
  const toggleRecording = async () => {
    console.log('[LIVE] toggleRecording - isRecording:', isRecording);

    try {
      if (isRecording) {
        console.log('[LIVE] Stopping...');
        setIsRecording(false);

        if (captureIntervalRef.current) {
          clearInterval(captureIntervalRef.current);
          captureIntervalRef.current = null;
        }

        stopMonitoring();
        setAnalysisStatus('idle');
      } else {
        console.log('[LIVE] Starting...');
        setIsRecording(true);
        setAnalysisStatus('idle');

        await startMonitoring();
        await startFrameCapture();
      }
    } catch (error) {
      console.error('[LIVE] Error:', error);
      Alert.alert('Erreur', 'Impossible de démarrer');
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#D85A30" />
          <Text style={styles.loadingText}>Demande de permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Ionicons name="close-circle" size={56} color="#EF4444" />
          <Text style={styles.errorTitle}>Permission refusée</Text>
          <Text style={styles.errorText}>Accès à la caméra refusé</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="front" ratio="16:9" />

      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🚗 Monitoring Conducteur</Text>
          <Ionicons
            name={isRecording ? 'videocam' : 'videocam-off'}
            size={24}
            color={isRecording ? '#EF4444' : '#9ca3af'}
          />
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBox,
              { backgroundColor: isRecording ? '#DCFCE7' : '#FEE2E2' },
            ]}
          >
            <Ionicons
              name={isRecording ? 'checkmark-circle' : 'close-circle'}
              size={20}
              color={isRecording ? '#0F6E56' : '#7F1D1D'}
            />
            <Text
              style={[
                styles.statusText,
                { color: isRecording ? '#0F6E56' : '#7F1D1D' },
              ]}
            >
              Status: {isRecording ? 'EN COURS' : 'Arrêté'}
            </Text>
          </View>

          <View
            style={[
              styles.statusBox,
              { backgroundColor: state.eyesClosed ? '#FEE2E2' : '#DCFCE7' },
            ]}
          >
            <Ionicons
              name={state.eyesClosed ? 'eye-off' : 'eye'}
              size={20}
              color={state.eyesClosed ? '#7F1D1D' : '#0F6E56'}
            />
            <Text
              style={[
                styles.statusText,
                { color: state.eyesClosed ? '#7F1D1D' : '#0F6E56' },
              ]}
            >
              Yeux: {state.eyesClosed ? 'FERMÉS' : 'Ouverts'}
            </Text>
          </View>

          <View
            style={[
              styles.statusBox,
              { backgroundColor: state.yawning ? '#FEE2E2' : '#DCFCE7' },
            ]}
          >
            <Ionicons
              name="happy"
              size={20}
              color={state.yawning ? '#7F1D1D' : '#0F6E56'}
            />
            <Text
              style={[
                styles.statusText,
                { color: state.yawning ? '#7F1D1D' : '#0F6E56' },
              ]}
            >
              Bâillement: {state.yawning ? 'OUI' : 'Non'}
            </Text>
          </View>
        </View>

        {/* Analysis Status */}
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisLabel}>
            📊 Analyse: {analysisStatus === 'analyzing' ? '⏳' : '✅'}
          </Text>
          <Text style={styles.analysisStatus}>{analysisStatus}</Text>
        </View>

        {/* Score */}
        <View style={styles.sleepinessContainer}>
          <Text style={styles.sleepinessLabel}>Score somnolence</Text>
          <View style={styles.sleepinessBar}>
            <View
              style={[
                styles.sleepinessProgress,
                {
                  width: `${state.sleepiness}%`,
                  backgroundColor:
                    state.sleepiness < 40
                      ? '#10b981'
                      : state.sleepiness < 70
                      ? '#F59E0B'
                      : '#EF4444',
                },
              ]}
            />
          </View>
          <Text style={styles.sleepinessScore}>{state.sleepiness}/100</Text>
        </View>

        {/* Alerte */}
        {state.alertActive && (
          <View style={styles.alertBanner}>
            <Ionicons name="alert-circle" size={24} color="#fff" />
            <Text style={styles.alertText}>🚨 SOMNOLENCE DÉTECTÉE!</Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={toggleRecording}
            style={[
              styles.recordButton,
              { backgroundColor: isRecording ? '#EF4444' : '#D85A30' },
            ]}
          >
            <Ionicons
              name={isRecording ? 'stop-circle' : 'play-circle'}
              size={28}
              color="#fff"
            />
            <Text style={styles.recordButtonText}>
              {isRecording ? 'Arrêter' : 'Démarrer'}
            </Text>
          </TouchableOpacity>

          {state.alertActive && (
            <TouchableOpacity
              onPress={stopAlarm}
              style={styles.dismissButton}
            >
              <Ionicons name="close" size={24} color="#fff" />
              <Text style={styles.dismissText}>OK - Je suis réveillé</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#9ca3af', fontSize: 14, marginTop: 12 },
  errorTitle: { color: '#EF4444', fontSize: 18, fontWeight: '700', marginTop: 16 },
  errorText: { color: '#9ca3af', fontSize: 14, marginTop: 8, textAlign: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  statusContainer: { gap: 8 },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  analysisContainer: {
    backgroundColor: 'rgba(100, 150, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  analysisLabel: { color: '#fff', fontSize: 11, fontWeight: '600' },
  analysisStatus: { color: '#6495ff', fontSize: 11, marginTop: 4 },
  sleepinessContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  sleepinessLabel: { color: '#fff', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  sleepinessBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sleepinessProgress: { height: '100%', borderRadius: 4 },
  sleepinessScore: { color: '#fff', fontSize: 12, fontWeight: '700', textAlign: 'right' },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  alertText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  footer: { gap: 8 },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  recordButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  dismissButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 8,
  },
  dismissText: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
