/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { ClipLoader } from "react-spinners";
import api from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login
  const login = async (email, password) => {
    const response = await api.post("/login", {
      email,
      password,
    });

    if (response.data.success) {
      setUser(response.data.user);
    }

    return response.data;
  };

  // Logout
  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Erreur logout :", error);
    } finally {
      setUser(null);
    }
  };

  // Check session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await api.get("/me");
        console.log("Réponse de l'API /me :", response.data);
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
        }}
      >
        <ClipLoader
          size={42}
          color="#111827"
        />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}