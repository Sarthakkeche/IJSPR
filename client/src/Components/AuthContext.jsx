import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // ✅ Load user from localStorage on app start
  useEffect(() => {
    const stored = localStorage.getItem("ijrwsUser");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // ✅ Handle login and logout globally
  const login = (userData) => {
    localStorage.setItem("ijrwsUser", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("ijrwsUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
