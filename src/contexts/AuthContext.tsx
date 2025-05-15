
import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  name?: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem("focusflow_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user", error);
        localStorage.removeItem("focusflow_user");
      }
    }
    setLoading(false);
  }, []);

  // Mock authentication functions
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we'd validate credentials with a backend
      if (!email || !password || password.length < 6) {
        toast.error("Invalid credentials");
        return false;
      }
      
      // Mock successful login
      const mockUser = {
        id: crypto.randomUUID(),
        email,
        name: email.split('@')[0]
      };
      
      setUser(mockUser);
      localStorage.setItem("focusflow_user", JSON.stringify(mockUser));
      toast.success("Login successful");
      return true;
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we'd validate and create a user with a backend
      if (!email || !password || password.length < 6) {
        toast.error("Invalid registration details");
        return false;
      }
      
      // Mock successful registration
      const mockUser = {
        id: crypto.randomUUID(),
        email,
        name: name || email.split('@')[0]
      };
      
      setUser(mockUser);
      localStorage.setItem("focusflow_user", JSON.stringify(mockUser));
      toast.success("Registration successful");
      return true;
    } catch (error) {
      console.error("Registration failed", error);
      toast.error("Registration failed");
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem("focusflow_user");
    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        isAuthenticated: !!user,
        login, 
        register, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
