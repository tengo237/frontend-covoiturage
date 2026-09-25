// utils/alarmManager.ts - VERSION FINALE (Vibration + Alerte)
import { Alert, Vibration } from 'react-native';

export class AlarmManager {
  private static isAlarmActive = false;

  static async initialize() {
    console.log('[ALARM] ✅ AlarmManager initialized');
  }

  static async triggerAlarm() {
    if (this.isAlarmActive) return;

    this.isAlarmActive = true;
    console.log('[ALARM] 🚨 ALARME SOMNOLENCE ACTIVÉE!');

    try {
      // 🔊 VIBRATION INTENSE
      Vibration.vibrate([
        300, 100,  // Vibration 1
        300, 100,  // Vibration 2
        300, 100,  // Vibration 3
        800,       // Vibration finale longue
      ]);

      // 🚨 ALERTE VISUELLE
      Alert.alert(
        '⚠️ ALERTE SOMNOLENCE!',
        'Le système a détecté une somnolence dangereuse!\n\n🛑 ARRÊTEZ IMMÉDIATEMENT et prenez une pause.',
        [
          {
            text: '✅ OK - Je suis réveillé',
            onPress: () => {
              this.stopAlarm();
            },
            style: 'destructive',
          },
        ],
        { cancelable: false }
      );

      console.log('[ALARM] ✅ Vibration + Alerte activées');
    } catch (error) {
      console.error('[ALARM] ❌ Error:', error);
      this.isAlarmActive = false;
    }
  }

  static async stopAlarm() {
    try {
      Vibration.cancel();
      this.isAlarmActive = false;
      console.log('[ALARM] ✅ Alarme arrêtée');
    } catch (error) {
      console.error('[ALARM] ❌ Error stopping alarm:', error);
    }
  }

  static getAlarmStatus() {
    return this.isAlarmActive;
  }
}
