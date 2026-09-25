import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const API_BASE_URL = 'http://12.0.3.9:8000';

interface TripInfo {
  departure_location: string;
  arrival_location: string;
  departure_time: string;
}

interface DriverInfo {
  id: number;
  name: string;
  email: string;
  photo_url: string;
}

interface Signalement {
  id: number;
  trip_id: number;
  driver_id: number;
  alert_type: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  latitude: number;
  longitude: number;
  created_at: string;
  trip: TripInfo | null;
  driver: DriverInfo | null;
}

export function useAdminSignalements() {
  const { token } = useUser();
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignalements = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('[useAdminSignalements] Fetching...');

        const url = filterStatus
          ? `${API_BASE_URL}/api/admin/signalements?status=${filterStatus}`
          : `${API_BASE_URL}/api/admin/signalements`;

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        console.log('[useAdminSignalements] Data:', data);

        if (data.data) setSignalements(data.data);
        setError(null);
      } catch (err: any) {
        console.error('[useAdminSignalements] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSignalements();
  }, [token, filterStatus]);

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      console.log(`[useAdminSignalements] Updating ${id} to ${newStatus}`);

      const response = await fetch(`${API_BASE_URL}/api/admin/signalements/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ new_status: newStatus }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      console.log('[useAdminSignalements] Update successful:', data);

      // Mettre à jour localement
      setSignalements(signalements.map(s => 
        s.id === id ? { ...s, status: newStatus as any } : s
      ));

      return data;
    } catch (err: any) {
      console.error('[useAdminSignalements] Update error:', err);
      throw err;
    }
  };

  return { signalements, loading, error, updateStatus, filterStatus, setFilterStatus };
}
