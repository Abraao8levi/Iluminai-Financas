import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings, UserProfile } from '../../types';
import { apiLogin, apiRegister, checkBackendStatus, updateUserProfile } from '../../services/api';

type AuthState = 'LOGIN' | 'SIGNUP' | 'AUTHENTICATED';

interface AuthContextType {
  authState: AuthState;
  setAuthState: (state: AuthState) => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  isBackendAvailable: boolean;
  isLoadingBackend: boolean;
  login: (e: string, p: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile> & Partial<AppSettings>) => Promise<void>;
}

const defaultProfile: UserProfile = {
  name: 'Usuário',
  email: 'usuario@exemplo.com',
  onlineSince: new Date()
};

const defaultSettings: AppSettings = {
  currency: 'BRL',
  theme: 'dark',
  notifications: true
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>('LOGIN');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('finanai_profile');
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('finanai_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean>(false);
  const [isLoadingBackend, setIsLoadingBackend] = useState<boolean>(true);

  useEffect(() => {
    const checkConnection = async () => {
      setIsLoadingBackend(true);
      const available = await checkBackendStatus();
      setIsBackendAvailable(available);
      setIsLoadingBackend(false);
    };

    checkConnection();
    const token = localStorage.getItem('auth_token');
    if (token) {
      setAuthState('AUTHENTICATED');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('finanai_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('finanai_settings', JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const login = async (email: string, pass: string) => {
    if (isBackendAvailable) {
      const data = await apiLogin(email, pass);
      setUserProfile(prev => ({
        ...prev,
        name: data.user.name || prev.name,
        email: data.user.email || prev.email,
        avatar: data.user.avatar || prev.avatar
      }));
    } else {
      localStorage.setItem('auth_token', 'mock_token_guest');
    }
    setAuthState('AUTHENTICATED');
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    if (isBackendAvailable) {
      const data = await apiRegister(userData);
      setUserProfile(prev => ({
        ...prev,
        name: data.user.name,
        email: data.user.email
      }));
    } else {
      setUserProfile(prev => ({
        ...prev,
        name: userData.name,
        email: userData.email
      }));
      localStorage.setItem('auth_token', 'mock_token_guest');
    }
    setAuthState('AUTHENTICATED');
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setAuthState('LOGIN');
  };

  const updateProfile = async (data: Partial<UserProfile> & Partial<AppSettings>) => {
    if (isBackendAvailable) {
      await updateUserProfile(data);
    }
    setUserProfile(prev => ({ ...prev, ...data }));
    if (data.theme || data.currency || data.notifications !== undefined) {
      setSettings(prev => ({
        ...prev,
        currency: data.currency || prev.currency,
        theme: data.theme || prev.theme,
        notifications: data.notifications !== undefined ? data.notifications : prev.notifications
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        setAuthState,
        userProfile,
        setUserProfile,
        settings,
        setSettings,
        isBackendAvailable,
        isLoadingBackend,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  }
  return context;
};
