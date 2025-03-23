
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Define user interface
interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'student' | 'admin';
}

// Define context interface
interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// Create provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  
  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('exam-portal-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Mock login function - would connect to a real API in production
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - in a real app, this would come from your authentication service
      const isAdmin = email.includes('admin');
      
      const userData: User = {
        id: '123456',
        email,
        displayName: email.split('@')[0],
        photoURL: null,
        role: isAdmin ? 'admin' : 'student'
      };
      
      // Store user in state and localStorage
      setUser(userData);
      localStorage.setItem('exam-portal-user', JSON.stringify(userData));
      
      // Show success toast
      toast.success('Logged in successfully');
      
      // Redirect based on role
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Mock register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const userData: User = {
        id: '123456',
        email,
        displayName: name,
        photoURL: null,
        role: 'student'
      };
      
      // Store user in state and localStorage
      setUser(userData);
      localStorage.setItem('exam-portal-user', JSON.stringify(userData));
      
      // Show success toast
      toast.success('Registration successful');
      
      // Redirect to student dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      // Clear user from state and localStorage
      setUser(null);
      localStorage.removeItem('exam-portal-user');
      
      // Show success toast
      toast.success('Logged out successfully');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
