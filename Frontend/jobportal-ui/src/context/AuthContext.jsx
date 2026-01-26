import { createContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = token ? jwtDecode(token) : null;

  const [auth, setAuth] = useState({ token, user });

  const login = (token) => {
    localStorage.setItem("token", token);
    setAuth({
      token,
      user: jwtDecode(token),
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