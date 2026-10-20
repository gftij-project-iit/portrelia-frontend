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

  const refreshUser = async () => {
    const response = await api.get("/me");

    if (response.data.success) {
      setUser(response.data.user);
      return response.data.user;
    }

    setUser(null);
    return null;
  };

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

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (error) {
      console.error("Erreur logout :", error);
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    let active = true;

    api
      .get("/me")
      .then((response) => {
        if (!active) return;

        if (response.data.success) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
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
        <ClipLoader size={42} color="#111827" />
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
        refreshUser,
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