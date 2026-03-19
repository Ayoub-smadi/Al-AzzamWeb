import React, { useState, useEffect } from "react";
import { AuthContext } from "@/hooks/use-auth";
import { useGetMe, type User } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('azzam_token'));
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    },
    request: { headers: getAuthHeaders() }
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('azzam_token', token);
    } else {
      localStorage.removeItem('azzam_token');
    }
  }, [token]);

  const login = (newToken: string, userObj: User) => {
    setToken(newToken);
    queryClient.setQueryData(['/api/auth/me'], userObj);
  };

  const logout = () => {
    setToken(null);
    queryClient.clear();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user: user || null,
      token,
      isLoading: !!token && isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
