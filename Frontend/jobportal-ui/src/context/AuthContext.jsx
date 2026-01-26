import { createContext, useState } from "react";
import jwt_decode from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = token ? jwt_decode(token) : null;

  const [auth, setAuth] = useState({ token, user });

  const login = (token) => {
    localStorage.setItem("token", token);
    setAuth({
      token,
      user: jwt_decode(token),
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuth({ token: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};