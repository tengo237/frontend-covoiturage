// hooks/useAdminApplications.ts
import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const API_BASE_URL = 'http://12.0.3.9:8000';

interface Application {
  id: number;
  passenger_id: number;
  trip_id: number;
  seats_booked: number;
  total_price: number;
  status: string;
  created_at: string;
}

export function useAdminApplications() {
  const { token } = useUser();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('[useAdminApplications] Fetching...');

        const response = await fetch(`${API_BASE_URL}/api/admin/driver-applications`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('[useAdminApplications] Data:', data);

        if (data.data) {
          setApplications(data.data);
        }
        setError(null);
      } catch (err: any) {
        console.error('[useAdminApplications] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token]);

  const updateStatus = async (appId: number, status: string) => {
    try {
      console.log(`[useAdminApplications] Updating ${appId} to ${status}`);

      const response = await fetch(`${API_BASE_URL}/api/admin/applications/${appId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ new_status: status }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[useAdminApplications] Update successful:', data);

      // Mettre à jour localement
      setApplications(applications.map(app => 
        app.id === appId ? { ...app, status } : app
      ));

      return data;
    } catch (err: any) {
      console.error('[useAdminApplications] Update error:', err);
      throw err;
    }
  };

  return { applications, loading, error, updateStatus };
}
