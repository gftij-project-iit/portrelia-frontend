/* eslint-disable react-refresh/only-export-components */

import { createContext, useState, useEffect } from "react"
import axios from "axios"
import {  signupApi ,logoutApi,getUserApi, refreshApi,loginApi } from "../../features/auth/api/authapi"






export const AuthContext = createContext()

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
 
 

  // LOGIN
  const login = async (email, password) => {
    console.log("Attempting login with:", { email, password})
    try {

      const res = await loginApi({
        email,
        password
      })
       if (res.data.requireOtp) {
      // Nouveau device / IP => on ne met pas encore le user
      return { requireOtp: true, email }; 
    }

      setUser(res.data.user)
      return res.data

    } catch (error) {

      console.error("Login error:", error)

      throw error
    }

  }

  // SIGNUP
  const signup = async (email, password,captchaToken) => {

    try {

      const res = await signupApi({
        email,
        password,
        captchaToken
      })

      return res.data

    } catch (error) {

      console.error("Signup error:", error)

      throw error
    }

  }

  // LOGOUT
  const logout = async () => {

    try {

      await logoutApi()

      setUser(null)

    } catch (error) {

      console.error("Logout error:", error)

    }

  }
   // --- LOGIN GOOGLE / OAUTH ---
const oauthLogin = async (provider, token) => {
  try {

    // Axios POST direct, URL complète
    const res = await axios.post("http://localhost:5000/api/oauth-login", {
      provider,
      token
    }, {
      withCredentials: true // si tu veux envoyer les cookies
    });

    setUser(res.data.user); // met à jour le user
    return res.data;
  } catch (error) {
    console.error(`${provider} login error:`, error);
    throw error;
  }
};
 
  // CHECK SESSION
  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await getUserApi();
      console.log("Session check response:", res.data);
      setUser(res.data.user);
    } catch (error) {
      console.error("Session check error:", error);
      try {
        // 🔁 TRY REFRESH
        await refreshApi();

        //  RETRY /me
        const res = await getUserApi();
        setUser(res.data.user);
        console.log("Session refreshed successfully");
      } catch (err) {
        setUser(null);
        console.error("Session refresh failed:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, []);
  

  
  return (

    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        oauthLogin,
        logout,
        loading,
        setUser
      }}
    >

      {children}

    </AuthContext.Provider>

  )

}