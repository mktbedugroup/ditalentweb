import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import type { User, Permission } from '../types';
import { api } from '../services/api';
import { PERMISSIONS } from '../constants';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Add a type for the company registration data
export type CompanyRegistrationData = {
    name: string;
    description: string;
    address: string;
    phone: string;
    rnc: string;
    employeeCount: string;
    industry: string;
};

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<{ user: User | null, token: string | null }>;
  register: (email: string, pass: string, role: 'candidate' | 'company', companyData?: CompanyRegistrationData) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutes in milliseconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    inactivityTimer.current = setTimeout(() => {
      console.log('Inactividad detectada, cerrando sesión...');
      // Call the actual logout logic
      updateUserAndPermissions(null);
      navigate('/login'); // Redirect to login page
    }, INACTIVITY_TIMEOUT);
  }, [clearInactivityTimer, navigate]);


  const updateUserAndPermissions = useCallback(async (loggedInUser: User | null) => {
    setUser(loggedInUser);
    if (loggedInUser) {
      sessionStorage.setItem('user', JSON.stringify(loggedInUser));
      
      if (loggedInUser.role === 'admin') {
        if (!loggedInUser.roleId) {
          // Super admin gets all permissions
          setPermissions(PERMISSIONS);
        } else {
          // Fetch permissions for the assigned role
          const role = await api.getRoleById(loggedInUser.roleId);
          setPermissions(role?.permissions || []);
        }
      } else {
        setPermissions([]); // Non-admin roles have no admin permissions
      }
      resetInactivityTimer(); // Reset timer on user activity/login
    } else {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      setPermissions([]);
      
      clearInactivityTimer(); // Clear timer on logout
    }
  }, [resetInactivityTimer, clearInactivityTimer]);

  useEffect(() => {
    const savedUserJson = sessionStorage.getItem('user');
    const savedToken = sessionStorage.getItem('token');
    if (savedUserJson && savedToken) {
      const savedUser = JSON.parse(savedUserJson);
      updateUserAndPermissions(savedUser);
    }
    setLoading(false);

    // Set up activity listeners
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);

    return () => {
      // Clean up
      clearInactivityTimer();
      window.removeEventListener('mousemove', resetInactivityTimer);
      window.removeEventListener('keydown', resetInactivityTimer);
      window.removeEventListener('scroll', resetInactivityTimer);
      window.removeEventListener('click', resetInactivityTimer);
    };
  }, [updateUserAndPermissions, resetInactivityTimer, clearInactivityTimer]);
  
  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
        const { user: loggedInUser, token } = await api.login(email, pass);
        sessionStorage.setItem('token', token);
        await updateUserAndPermissions(loggedInUser);
        resetInactivityTimer(); // Start timer after successful login
        return { user: loggedInUser, token };
    } finally {
        setLoading(false);
    }
  };

  const register = async (email: string, pass: string, role: 'candidate' | 'company', companyData?: CompanyRegistrationData) => {
      setLoading(true);
      try {
        const newUser = await api.register(email, pass, role, companyData);
        await updateUserAndPermissions(newUser);
        return newUser;
      } finally {
        setLoading(false);
      }
  }

  const logout = () => {
    updateUserAndPermissions(null);
    navigate('/login'); // Ensure navigation to login on explicit logout
  };
  
  const hasPermission = (permission: Permission) => {
      return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, permissions, hasPermission }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};