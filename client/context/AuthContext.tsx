import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'donor' | 'ngo_admin' | 'app_admin';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
}

interface AuthContextType {
  user: UserData | null;
  userData: UserData | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  setRole: (role: UserRole) => void;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database (stored in localStorage)
const MOCK_USERS_KEY = 'fundhub_mock_users';
const CURRENT_USER_KEY = 'fundhub_current_user';
const SELECTED_ROLE_KEY = 'fundhub_selected_role';

function getMockUsers(): { [email: string]: { password: string; userData: UserData } } {
  const stored = localStorage.getItem(MOCK_USERS_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveMockUsers(users: { [email: string]: { password: string; userData: UserData } }) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const currentUser = localStorage.getItem(CURRENT_USER_KEY);
    const selectedRole = localStorage.getItem(SELECTED_ROLE_KEY);
    
    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        setUser(userData);
        setUserData(userData);
        if (selectedRole) {
          setRoleState(selectedRole as UserRole);
        }
      } catch (err) {
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(SELECTED_ROLE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const setRole = (selectedRole: UserRole) => {
    setRoleState(selectedRole);
    localStorage.setItem(SELECTED_ROLE_KEY, selectedRole);
  };

  const register = async (email: string, password: string, name: string, selectedRole: UserRole) => {
    try {
      setError(null);

      const users = getMockUsers();
      if (users[email]) {
        throw new Error('Email already registered');
      }

      if (!email || !password || !name) {
        throw new Error('Please fill in all fields');
      }

      const uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userData: UserData = {
        uid,
        email,
        displayName: name,
        role: selectedRole,
      };

      users[email] = {
        password,
        userData,
      };

      saveMockUsers(users);

      // Link NGO Admin to selected NGO
      if (selectedRole === 'ngo_admin') {
        const selectedNgoId = localStorage.getItem('selected_ngo_id');
        if (selectedNgoId) {
          const ngoData = localStorage.getItem('fundhub_ngos');
          const ngos = ngoData ? JSON.parse(ngoData) : [];

          const updatedNgos = ngos.map((ngo: any) => {
            if (ngo.id === selectedNgoId) {
              return {
                ...ngo,
                adminId: uid,
                adminEmail: email,
                adminName: name,
              };
            }
            return ngo;
          });

          localStorage.setItem('fundhub_ngos', JSON.stringify(updatedNgos));
          localStorage.setItem('user_ngo_id', selectedNgoId);
        }
      }

      setUser(userData);
      setUserData(userData);
      setRoleState(selectedRole);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      localStorage.setItem(SELECTED_ROLE_KEY, selectedRole);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);

      const users = getMockUsers();
      const userRecord = users[email];

      if (!userRecord) {
        throw new Error('User not found');
      }

      if (userRecord.password !== password) {
        throw new Error('Incorrect password');
      }

      const userData = userRecord.userData;
      setUser(userData);
      setUserData(userData);
      setRoleState(userData.role);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
      localStorage.setItem(SELECTED_ROLE_KEY, userData.role);

      // For NGO Admins, find their associated NGO
      if (userData.role === 'ngo_admin') {
        const ngoData = localStorage.getItem('fundhub_ngos');
        if (ngoData) {
          const ngos = JSON.parse(ngoData);
          const userNgo = ngos.find((ngo: any) => ngo.adminId === userData.uid);
          if (userNgo) {
            localStorage.setItem('user_ngo_id', userNgo.id);
          } else {
            // If no NGO found by adminId, check selected_ngo_id
            const selectedNgoId = localStorage.getItem('selected_ngo_id');
            if (selectedNgoId) {
              const selectedNgo = ngos.find((ngo: any) => ngo.id === selectedNgoId);
              if (selectedNgo) {
                // Update the NGO with admin info
                const updatedNgos = ngos.map((ngo: any) => {
                  if (ngo.id === selectedNgoId) {
                    return {
                      ...ngo,
                      adminId: userData.uid,
                      adminEmail: userData.email,
                      adminName: userData.displayName,
                    };
                  }
                  return ngo;
                });
                localStorage.setItem('fundhub_ngos', JSON.stringify(updatedNgos));
                localStorage.setItem('user_ngo_id', selectedNgoId);
              }
            }
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setUser(null);
      setUserData(null);
      setRoleState(null);
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(SELECTED_ROLE_KEY);
      localStorage.removeItem('selected_ngo_id');
      localStorage.removeItem('user_ngo_id');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    role,
    loading,
    error,
    setRole,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
