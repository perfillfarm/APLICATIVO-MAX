import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem('currentUser');
      const storedToken = await AsyncStorage.getItem('authToken');

      if (storedUser && storedToken) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Buscar usuários registrados
      const usersData = await AsyncStorage.getItem('registeredUsers');
      const users: User[] = usersData ? JSON.parse(usersData) : [];
      
      // Verificar credenciais
      const foundUser = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password
      );
      
      if (foundUser) {
        // Verificar se perfil existe, se não criar um com dados do usuário
        const existingProfile = await AsyncStorage.getItem('userProfile');
        if (!existingProfile) {
          const initialProfile = {
            name: foundUser.name,
            email: foundUser.email,
            dateOfBirth: '',
            gender: 'male',
            phone: '',
            startDate: new Date().toLocaleDateString('pt-BR'),
            profileImage: undefined,
          };
          await AsyncStorage.setItem('userProfile', JSON.stringify(initialProfile));
        }
        
        // Login bem-sucedido
        setUser(foundUser);
        setIsAuthenticated(true);
        
        // Salvar sessão
        await AsyncStorage.setItem('currentUser', JSON.stringify(foundUser));
        await AsyncStorage.setItem('authToken', `token_${Date.now()}`);
        
        return true;
      } else {
        Alert.alert('Erro', 'Email ou senha incorretos');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Erro', 'Falha no login. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      setLoading(true);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se email já existe
      const usersData = await AsyncStorage.getItem('registeredUsers');
      const users: User[] = usersData ? JSON.parse(usersData) : [];
      
      const emailExists = users.find(u => 
        u.email.toLowerCase() === userData.email.toLowerCase()
      );
      
      if (emailExists) {
        Alert.alert('Erro', 'Este email já está cadastrado');
        return false;
      }
      
      // Criar novo usuário
      const newUser: User = {
        ...userData,
        id: `user_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      // Salvar no banco de dados
      users.push(newUser);
      await AsyncStorage.setItem('registeredUsers', JSON.stringify(users));
      
      // Criar perfil inicial com dados do cadastro
      const initialProfile = {
        name: userData.name,
        email: userData.email,
        dateOfBirth: '',
        gender: 'male',
        phone: '',
        startDate: new Date().toLocaleDateString('pt-BR'),
        profileImage: undefined,
      };
      
      // Salvar perfil inicial
      await AsyncStorage.setItem('userProfile', JSON.stringify(initialProfile));
      
      // Login automático após registro
      setUser(newUser);
      setIsAuthenticated(true);
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
      await AsyncStorage.setItem('authToken', `token_${Date.now()}`);
      
      Alert.alert('Sucesso', 'Conta criada com sucesso!');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Erro', 'Falha no cadastro. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setIsAuthenticated(false);
      setUser(null);
      await AsyncStorage.removeItem('currentUser');
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        checkAuthState
      }}
    >
      {children}
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