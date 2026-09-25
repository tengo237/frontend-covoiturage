import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const API_BASE_URL = 'http://12.0.3.9:8000';

interface DriverRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  photo_url: string;
  roles: string;
  current_role: string;
  created_at: string;
  is_active: boolean;
}

export function useAdminDriverRequests() {
  const { token } = useUser();
  const [requests, setRequests] = useState<DriverRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('[useAdminDriverRequests] Fetching...');

        const response = await fetch(`${API_BASE_URL}/api/admin/driver-requests`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();
        console.log('[useAdminDriverRequests] Data:', data);

        if (data.data) setRequests(data.data);
        setError(null);
      } catch (err: any) {
        console.error('[useAdminDriverRequests] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [token]);

  const approveDriver = async (id: number) => {
    try {
      console.log(`[useAdminDriverRequests] Approving ${id}`);

      const response = await fetch(`${API_BASE_URL}/api/admin/drivers/${id}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      console.log('[useAdminDriverRequests] Approve successful:', data);

      // Retirer de la liste
      setRequests(requests.filter(r => r.id !== id));

      return data;
    } catch (err: any) {
      console.error('[useAdminDriverRequests] Approve error:', err);
      throw err;
    }
  };

  const rejectDriver = async (id: number, reason: string = '') => {
    try {
      console.log(`[useAdminDriverRequests] Rejecting ${id}`);

      const response = await fetch(`${API_BASE_URL}/api/admin/drivers/${id}/reject?reason=${encodeURIComponent(reason)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      console.log('[useAdminDriverRequests] Reject successful:', data);

      // Retirer de la liste
      setRequests(requests.filter(r => r.id !== id));

      return data;
    } catch (err: any) {
      console.error('[useAdminDriverRequests] Reject error:', err);
      throw err;
    }
  };

  return { requests, loading, error, approveDriver, rejectDriver };
}
