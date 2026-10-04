import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const API_BASE_URL = 'http://12.0.0.59:8000';

// ✅ INTERFACE CORRIGÉE - Données du véhicule + info conducteur
interface DriverRequest {
  id: number;  // vehicle.id
  user_id: number;  // vehicle.user_id
  driver_name: string;  // driver.name
  driver_email: string;  // driver.email
  brand: string;
  model: string;
  plate: string;
  color: string;
  vehicle_photo_url: string;
  id_doc_url: string;
  registration_doc_url: string;
  selfie_url: string;
  is_verified: boolean;
  created_at: string;
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
        console.log('[useAdminDriverRequests] Fetching unverified vehicles...');

        // ✅ APPELER LA NOUVELLE ROUTE
        const response = await fetch(`${API_BASE_URL}/api/admin/unverified-vehicles`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('[useAdminDriverRequests] Data:', data);

        if (data.data) {
          setRequests(data.data);
        }
        setError(null);
      } catch (err: any) {
        console.error('[useAdminDriverRequests] Error:', err);
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [token]);

  // ✅ APPROUVER UN CONDUCTEUR - Valider le véhicule
  const approveDriver = async (vehicleId: number) => {
    try {
      console.log(`[useAdminDriverRequests] Approving vehicle ${vehicleId}`);

      // ✅ UTILISER LA NOUVELLE ROUTE
      const response = await fetch(`${API_BASE_URL}/api/admin/vehicles/${vehicleId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[useAdminDriverRequests] Approve successful:', data);

      // Retirer de la liste
      setRequests(requests.filter(r => r.id !== vehicleId));

      return data;
    } catch (err: any) {
      console.error('[useAdminDriverRequests] Approve error:', err);
      throw err;
    }
  };

  // ✅ REJETER UN CONDUCTEUR - Rejeter le véhicule
  const rejectDriver = async (vehicleId: number, reason: string = '') => {
    try {
      console.log(`[useAdminDriverRequests] Rejecting vehicle ${vehicleId}`);

      // ✅ UTILISER LA NOUVELLE ROUTE
      const response = await fetch(
        `${API_BASE_URL}/api/admin/vehicles/${vehicleId}/reject${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[useAdminDriverRequests] Reject successful:', data);

      // Retirer de la liste
      setRequests(requests.filter(r => r.id !== vehicleId));

      return data;
    } catch (err: any) {
      console.error('[useAdminDriverRequests] Reject error:', err);
      throw err;
    }
  };

  return { requests, loading, error, approveDriver, rejectDriver };
}
