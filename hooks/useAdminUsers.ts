import { useState, useCallback, useEffect } from 'react';
import { useUser } from '../context/UserContext';

const API_BASE_URL = 'http://12.0.3.9:8000';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  photo_url?: string;
  roles: string;
  current_role: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
}

export function useAdminUsers() {
  const { token } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) {
      console.log('[useAdminUsers] No token');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('[useAdminUsers] Fetching users...');

      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('[useAdminUsers] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[useAdminUsers] Users data:', data);

      if (data.data && Array.isArray(data.data)) {
        setUsers(data.data);
        console.log('[useAdminUsers] ✅ Loaded', data.data.length, 'users');
      }

      setError(null);
    } catch (err: any) {
      console.error('[useAdminUsers] ❌ Error:', err);
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token, fetchUsers]);

  // ============================================
  // Bloquer/Débloquer un utilisateur
  // ============================================
  const toggleUserActive = useCallback(
    async (userId: number, isActive: boolean) => {
      if (!token) {
        throw new Error('Token not found');
      }

      try {
        console.log(`[useAdminUsers] TOGGLE START - User ${userId}, isActive=${isActive}`);

        const url = `${API_BASE_URL}/api/admin/users/${userId}/active`;
        const payload = { is_active: isActive };

        console.log('[useAdminUsers] URL:', url);
        console.log('[useAdminUsers] PAYLOAD:', JSON.stringify(payload));
        console.log('[useAdminUsers] TOKEN exists:', !!token);

        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const statusCode = response.status;
        console.log('[useAdminUsers] RESPONSE STATUS:', statusCode);

        // Récupérer le body
        const responseText = await response.text();
        console.log('[useAdminUsers] RESPONSE BODY (RAW):', responseText);
        console.log('[useAdminUsers] RESPONSE BODY LENGTH:', responseText.length);

        if (!response.ok) {
          // Essayer de parser comme JSON
          let errorMsg = `Server error ${statusCode}`;
          
          if (responseText) {
            try {
              const parsed = JSON.parse(responseText);
              errorMsg = parsed.detail || parsed.message || JSON.stringify(parsed);
            } catch (e) {
              errorMsg = responseText;
            }
          }

          console.log('[useAdminUsers] ERROR MESSAGE:', errorMsg);
          throw new Error(errorMsg);
        }

        // Succès - parser le body
        let data = {};
        if (responseText) {
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            data = { success: true };
          }
        }

        console.log('[useAdminUsers] ✅ SUCCESS:', data);

        // Mettre à jour localement
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, is_active: isActive } : user
          )
        );

        return { success: true, data };
      } catch (err: any) {
        console.error('[useAdminUsers] ❌ CATCH ERROR:', err.message || err);
        throw err;
      }
    },
    [token]
  );

  return {
    users,
    loading,
    error,
    fetchUsers,
    toggleUserActive,
  };
}