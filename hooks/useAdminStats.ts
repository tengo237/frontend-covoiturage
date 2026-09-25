import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const API_BASE_URL = 'http://12.0.3.9:8000';

interface AdminStats {
  users: { count: number; change: string };
  trips: { count: number; change: string };
  alerts: { count: number; change: string };
  pending: { count: number; change: string };
}

interface AdminActivity {
  id: number;
  title: string;
  time: string;
  icon: string;
}

export function useAdminStats() {
  const { token } = useUser();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        console.log('[useAdminStats] No token');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('[useAdminStats] Fetching stats...');

        const statsResponse = await fetch(`${API_BASE_URL}/api/admin/stats`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        console.log('[useAdminStats] Response status:', statsResponse.status);

        if (!statsResponse.ok) {
          const errorText = await statsResponse.text();
          throw new Error(`Stats API error: ${statsResponse.status} - ${errorText}`);
        }

        const statsData = await statsResponse.json();
        console.log('[useAdminStats] Stats data:', statsData);

        if (statsData.data) {
          setStats(statsData.data);
        }

        // Fetch activities
        try {
          const activitiesResponse = await fetch(`${API_BASE_URL}/api/admin/activities`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (activitiesResponse.ok) {
            const activitiesData = await activitiesResponse.json();
            console.log('[useAdminStats] Activities data:', activitiesData);

            if (activitiesData.data) {
              setActivities(activitiesData.data);
            }
          }
        } catch (e) {
          console.log('[useAdminStats] Activities error (non-bloquant):', e);
        }

        setError(null);
      } catch (err: any) {
        console.error('[useAdminStats] Error:', err);
        setError(err.message || 'Erreur lors de la récupération des statistiques');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const refresh = async () => {
    if (!token) return;

    try {
      setLoading(true);
      console.log('[useAdminStats] Manual refresh...');

      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setStats(data.data);
          console.log('[useAdminStats] Refresh successful');
        }
      }
    } catch (err: any) {
      console.error('[useAdminStats] Refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  return { stats, activities, loading, error, refresh };
}