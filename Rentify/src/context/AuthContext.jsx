import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { AUTH_LOGOUT_EVENT } from "../api/axios";

const AuthContext = createContext();

// Returns the decoded token if it is well-formed and not expired, otherwise null.
const decodeValidToken = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp && decoded.exp * 1000 <= Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("token");
    if (stored && !decodeValidToken(stored)) {
      localStorage.removeItem("token"); // drop expired/garbage tokens on startup
      return null;
    }
    return stored;
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }, []);

  useEffect(() => {
    const decoded = decodeValidToken(token);
    if (token && !decoded) {
      logout();
    } else {
      setUser(decoded ? { ...decoded, token } : null);
    }
    setLoading(false);

    // Log out automatically the moment the token expires.
    if (decoded?.exp) {
      const msLeft = decoded.exp * 1000 - Date.now();
      const timer = setTimeout(logout, msLeft);
      return () => clearTimeout(timer);
    }
  }, [token, logout]);

  // The axios interceptor fires this event when the backend answers 401.
  useEffect(() => {
    window.addEventListener(AUTH_LOGOUT_EVENT, logout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
