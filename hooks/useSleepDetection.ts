// hooks/useSleepDetection.ts - DÉTECTION CLIGNEMENT vs SOMMEIL
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
  const [isMonitoring, setIsMonitoring] = useState(false);

  // ✅ Refs pour le timing
  const lastAccelerationRef = useRef({ x: 0, y: 0, z: 0 });
  const sensorSubscriptionRef = useRef<any>(null);
  const eyesClosedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const eyesClosedStartTimeRef = useRef<number | null>(null);
  const alarmTriggeredRef = useRef(false);
  
  // ✅ NOUVEAU: Pour distinguer clignement vs sommeil
  const isBlinkRef = useRef(true);  // true = clignement, false = sommeil

  useEffect(() => {
    console.log('[🔵 HOOK INIT] useSleepDetection mounted');
    
    const init = async () => {
      try {
        await AlarmManager.initialize();
        setFacemeshModel({ initialized: true });
        console.log('[🔵 INIT] ✅ AlarmManager ready');
      } catch (error) {
        console.error('[🔵 INIT] ❌', error);
      }
    };

    init();

    return () => {
      console.log('[🔵 CLEANUP] Unmounting');
      if (eyesClosedTimerRef.current) {
        clearInterval(eyesClosedTimerRef.current);
      }
      if (sensorSubscriptionRef.current) {
        sensorSubscriptionRef.current.remove();
      }
    };
  }, []);

  const startMonitoring = useCallback(() => {
    console.log('[🟢 START] Monitoring...');
    setIsMonitoring(true);
    lastAccelerationRef.current = { x: 0, y: 0, z: 0 };
    alarmTriggeredRef.current = false;
    eyesClosedStartTimeRef.current = null;
    isBlinkRef.current = true;

    setState({
      isLoading: false,
      sleepiness: 0,
      alertActive: false,
      eyesClosed: false,
      yawning: false,
      headTilted: false,
    });

    try {
      if (sensorSubscriptionRef.current) {
        sensorSubscriptionRef.current.remove();
      }

      Accelerometer.setUpdateInterval(1000);

      const subscription = Accelerometer.addListener((data) => {
        const { x, y, z } = data;
        const deltaX = Math.abs(x - lastAccelerationRef.current.x);
        const deltaY = Math.abs(y - lastAccelerationRef.current.y);
        const deltaZ = Math.abs(z - lastAccelerationRef.current.z);
        const totalDelta = deltaX + deltaY + deltaZ;

        console.log(`[📊] Δ=${totalDelta.toFixed(2)}`);
        lastAccelerationRef.current = { x, y, z };

        // ✅ PEU DE MOUVEMENT = YEUX FERMÉS
        if (totalDelta < 2.0) {
          // Yeux viennent de se fermer
          if (!eyesClosedStartTimeRef.current) {
            console.log('[👁️ EYES CLOSED] Starting timer');
            eyesClosedStartTimeRef.current = Date.now();
            isBlinkRef.current = true;  // ✅ Assume clignement au départ

            // Démarrer le timer
            if (eyesClosedTimerRef.current) {
              clearInterval(eyesClosedTimerRef.current);
            }

            eyesClosedTimerRef.current = setInterval(() => {
              if (!eyesClosedStartTimeRef.current) return;

              const elapsed = Math.floor(
                (Date.now() - eyesClosedStartTimeRef.current) / 1000
              );

              // ✅ NOUVELLE LOGIQUE: Distinguer clignement vs sommeil
              
              // Si < 2 sec = clignement (score = 0)
              if (elapsed < 2) {
                console.log(`[👁️ BLINK] ${elapsed}s (score = 0)`);
                setState((prev) => ({
                  ...prev,
                  sleepiness: 0,
                  eyesClosed: true,
                }));
                isBlinkRef.current = true;
              } 
              // Si >= 2 sec = sommeil (score monte)
              else if (elapsed >= 2 && !alarmTriggeredRef.current) {
                isBlinkRef.current = false;
                console.log(`[😴 SLEEP] ${elapsed}s / 30s`);

                // Calculer le score: (temps depuis 2 sec / 28 sec) × 1700
                // Donc à sec 2  → 0
                //      à sec 30 → 1700
                const sleepElapsed = elapsed - 2;  // Temps depuis le début du sommeil
                const score = Math.min((sleepElapsed / 28) * 1700, 1700);

                setState((prev) => ({
                  ...prev,
                  sleepiness: score,
                  eyesClosed: true,
                }));

                // ✅ À 30 SEC: ALARME!
                if (elapsed >= 30 && !alarmTriggeredRef.current) {
                  console.log('[🚨 ALARM! 30 SECONDS OF REAL SLEEP!]');
                  alarmTriggeredRef.current = true;

                  setState((prev) => ({
                    ...prev,
                    sleepiness: 1700,
                    alertActive: true,
                    eyesClosed: true,
                  }));

                  // Trigger alarme
                  AlarmManager.triggerAlarm().catch((e) => 
                    console.error('[❌ Alarm error:', e)
                  );

                  // Arrêter le timer
                  if (eyesClosedTimerRef.current) {
                    clearInterval(eyesClosedTimerRef.current);
                    eyesClosedTimerRef.current = null;
                  }
                }
              }
            }, 1000);
          }
        } 
        // ✅ MOUVEMENT = YEUX OUVERTS
        else {
          console.log('[✅ EYES OPEN]');

          // ✅ Si c'était un clignement (< 2 sec), reset le score à 0
          if (isBlinkRef.current && eyesClosedStartTimeRef.current) {
            const closedDuration = Math.floor(
              (Date.now() - eyesClosedStartTimeRef.current) / 1000
            );
            
            if (closedDuration < 2) {
              console.log(`[✅ BLINK DETECTED] (${closedDuration}s) - Score reset to 0`);
              setState((prev) => ({
                ...prev,
                sleepiness: 0,
                eyesClosed: false,
              }));
            }
          }

          // Arrêter le timer
          if (eyesClosedTimerRef.current) {
            clearInterval(eyesClosedTimerRef.current);
            eyesClosedTimerRef.current = null;
          }

          eyesClosedStartTimeRef.current = null;
          isBlinkRef.current = true;

          // Si l'alarme n'a pas été déclenchée, reset complètement
          if (!alarmTriggeredRef.current) {
            setState((prev) => ({
              ...prev,
                sleepiness: 0,
              eyesClosed: false,
            }));
          }
        }
      });

      sensorSubscriptionRef.current = subscription;
      console.log('[✅] Monitoring started');
    } catch (error) {
      console.error('[❌] Start error:', error);
    }
  }, []);

  const stopMonitoring = useCallback(() => {
    console.log('[🛑] Stopping monitoring');
    setIsMonitoring(false);

    if (eyesClosedTimerRef.current) {
      clearInterval(eyesClosedTimerRef.current);
      eyesClosedTimerRef.current = null;
    }

    if (sensorSubscriptionRef.current) {
      sensorSubscriptionRef.current.remove();
      sensorSubscriptionRef.current = null;
    }

    AlarmManager.stopAlarm().catch((e) => console.error('[❌]', e));

    eyesClosedStartTimeRef.current = null;
    alarmTriggeredRef.current = false;
    isBlinkRef.current = true;

    setState((prev) => ({
      ...prev,
      sleepiness: 0,
      alertActive: false,
      eyesClosed: false,
    }));

    console.log('[✅] Stopped');
  }, []);

  const stopAlarm = useCallback(async () => {
    console.log('[⏸️] Dismissing alarm');

    await AlarmManager.stopAlarm();

    if (eyesClosedTimerRef.current) {
      clearInterval(eyesClosedTimerRef.current);
      eyesClosedTimerRef.current = null;
    }

    eyesClosedStartTimeRef.current = null;
    alarmTriggeredRef.current = false;
    isBlinkRef.current = true;

    setState((prev) => ({
      ...prev,
      alertActive: false,
      sleepiness: 0,
      eyesClosed: false,
    }));

    console.log('[✅] Alarm dismissed');
  }, []);

  return {
    state,
    facemeshModel,
    stopAlarm,
    startMonitoring,
    stopMonitoring,
    isMonitoring,
    analyzeFace: async () => {},
  };
}
