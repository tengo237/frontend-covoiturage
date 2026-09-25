// hooks/useSleepDetection.ts - DEBUG VERSION FIXÉE
import { useEffect, useState, useCallback, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { AlarmManager } from '../utils/alarmManager';

interface SleepDetectionState {
  isLoading: boolean;
  sleepiness: number;
  eyesClosed: boolean;
  yawning: boolean;
  headTilted: boolean;
  alertActive: boolean;
}

export function useSleepDetection() {
  const [state, setState] = useState<SleepDetectionState>({
    isLoading: false,
    sleepiness: 0,
    eyesClosed: false,
    yawning: false,
    headTilted: false,
    alertActive: false,
  });

  const [facemeshModel, setFacemeshModel] = useState<any>(null);
  const inactivityCounterRef = useRef(0);  // ← REF (synchrone!)
  const lastAccelerationRef = useRef({ x: 0, y: 0, z: 0 });
  const sensorSubscriptionRef = useRef<any>(null);
  const isAlarmingRef = useRef(false);  // ← Flag pour éviter redéclenchement!
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Initialiser AlarmManager
  useEffect(() => {
    console.log('[🔵 HOOK INIT] useSleepDetection component mounted');
    
    const init = async () => {
      try {
        console.log('[🔵 INIT] Initializing AlarmManager...');
        await AlarmManager.initialize();
        setFacemeshModel({ initialized: true });
        console.log('[🔵 INIT] ✅ AlarmManager initialized');
      } catch (error) {
        console.error('[🔵 INIT] ❌ Error:', error);
      }
    };

    init();

    return () => {
      console.log('[🔵 CLEANUP] useSleepDetection unmounting');
    };
  }, []);

  // Démarrer monitoring
  const startMonitoring = useCallback(() => {
    console.log('[🟢 START] 🚀 startMonitoring called!');
    setIsMonitoring(true);
    inactivityCounterRef.current = 0;  // ← Réinitialiser ref
    isAlarmingRef.current = false;     // ← Réinitialiser flag
    lastAccelerationRef.current = { x: 0, y: 0, z: 0 };

    setState({
      isLoading: false,
      sleepiness: 0,
      alertActive: false,
      eyesClosed: false,
      yawning: false,
      headTilted: false,
    });

    try {
      // Désabonner d'abord si déjà abonné
      if (sensorSubscriptionRef.current) {
        console.log('[🟢 START] Removing old subscription first...');
        sensorSubscriptionRef.current.remove();
      }

      console.log('[🟢 START] Setting accelerometer interval to 1000ms...');
      Accelerometer.setUpdateInterval(1000);

      console.log('[🟢 START] Adding accelerometer listener...');
      const subscription = Accelerometer.addListener((accelerometerData) => {
        const { x, y, z } = accelerometerData;

        const deltaX = Math.abs(x - lastAccelerationRef.current.x);
        const deltaY = Math.abs(y - lastAccelerationRef.current.y);
        const deltaZ = Math.abs(z - lastAccelerationRef.current.z);
        const totalDelta = deltaX + deltaY + deltaZ;

        console.log(
          '[📊 ACCEL] x:',
          x.toFixed(3),
          'y:',
          y.toFixed(3),
          'z:',
          z.toFixed(3),
          '| ΔTotal:',
          totalDelta.toFixed(3)
        );

        lastAccelerationRef.current = { x, y, z };

        // Très faible mouvement (seuil élevé = besoin de plus de mouvement pour reset)
        if (totalDelta < 2.0) {
          // Incrémenter le compteur (synchrone via ref!)
          inactivityCounterRef.current += 1;
          const newCounter = inactivityCounterRef.current;
          
          console.log('[⚠️ INACTIVE] Counter:', newCounter, '(Δ:', totalDelta.toFixed(3) + ')');

          let sleepScore = 0;

          if (newCounter >= 3) {
            sleepScore = Math.min(newCounter * 20, 100);
            console.log('[😴 SLEEPY] Score:', sleepScore);
          }

          // TRIGGER ALARME SEULEMENT SI PAS DÉJÀ EN ALARME!
          if (newCounter >= 4 && !isAlarmingRef.current) {
            isAlarmingRef.current = true;  // ← SET FLAG!
            console.log('[🚨 ALARM TRIGGER!] Counter:', newCounter);

            setState((prev) => ({
              ...prev,
              sleepiness: 100,
              eyesClosed: true,
              alertActive: true,
            }));

            AlarmManager.triggerAlarm();
          } else {
            setState((prev) => ({
              ...prev,
              sleepiness: sleepScore,
              eyesClosed: newCounter > 0,
              alertActive: isAlarmingRef.current,
            }));
          }
        } else {
          // MOUVEMENT SIGNIFICATIF DÉTECTÉ!
          console.log('[✅ STRONG MOVEMENT] Delta:', totalDelta.toFixed(3), '→ Auto-stopping alarm!');
          
          // Réinitialiser (synchrone!)
          inactivityCounterRef.current = 0;
          isAlarmingRef.current = false;  // ← RESET FLAG!
          
          AlarmManager.stopAlarm();
          
          setState((prev) => ({
            ...prev,
            sleepiness: 0,
            eyesClosed: false,
            alertActive: false,
          }));
        }
      });

      sensorSubscriptionRef.current = subscription;
      console.log('[✅ START] Monitoring started successfully!');
    } catch (error) {
      console.error('[❌ START] Error:', error);
      alert('Erreur: ' + String(error));
    }
  }, []);

  // Arrêter monitoring
  const stopMonitoring = useCallback(() => {
    console.log('[🛑 STOP] Stopping monitoring...');
    setIsMonitoring(false);

    if (sensorSubscriptionRef.current) {
      console.log('[🛑 STOP] Removing subscription...');
      sensorSubscriptionRef.current.remove();
      sensorSubscriptionRef.current = null;
    }

    AlarmManager.stopAlarm();
    inactivityCounterRef.current = 0;     // ← Utiliser ref
    isAlarmingRef.current = false;        // ← Reset flag
    lastAccelerationRef.current = { x: 0, y: 0, z: 0 };

    setState((prev) => ({
      ...prev,
      sleepiness: 0,
      alertActive: false,
      eyesClosed: false,
    }));

    console.log('[🛑 STOP] ✅ Stopped');
  }, []);

  // Dummy - capteurs s'en chargent
  const analyzeFace = useCallback(async (frameUri: string) => {
    console.log('[FRAME] Frame received (capteurs actifs)');
  }, []);

  // Stop alarm
  const stopAlarm = useCallback(async () => {
    console.log('[⏸️ DISMISS] User dismissed alarm');
    await AlarmManager.stopAlarm();

    inactivityCounterRef.current = 0;      // ← Utiliser ref (SYNCHRONE!)
    isAlarmingRef.current = false;         // ← Reset flag (SYNCHRONE!)
    
    setState((prev) => ({
      ...prev,
      alertActive: false,
      sleepiness: 0,
      eyesClosed: false,
    }));
    
    console.log('[⏸️ DISMISS] ✅ Alarm stopped and counters reset');
  }, []);

  return {
    state,
    analyzeFace,
    facemeshModel,
    stopAlarm,
    startMonitoring,
    stopMonitoring,
    isMonitoring,
  };
}
