import { ref, computed } from 'vue';
import { api } from './useApi';

interface User {
  id: number;
  username: string;
  email: string;
  roles?: Array<{ id: number; name: string }>;
}

interface Character {
  id: number;
  display_name: string;
  realm_level: number;
  exp: number;
  strength: number;
  agility: number;
  wisdom: number;
}

interface AuthState {
  user: User | null;
  character: Character | null;
  token: string | null;
}

const authState = ref<AuthState>({
  user: null,
  character: null,
  token: localStorage.getItem('token'),
});

export const useAuth = () => {
  const isAuthenticated = computed(() => !!authState.value.token);
  const isAdmin = computed(() => {
    return (
      authState.value.user?.roles?.some((role) => role.name === 'admin') || false
    );
  });

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      console.log('Login response:', response);
      
      // api is axios instance, so response.data contains the actual data
      const { user, character, token } = response.data;

      if (!user || !token) {
        throw new Error('Invalid response from server');
      }

      authState.value = { user, character, token };
      localStorage.setItem('token', token);

      return { success: true, user, character };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return {
          success: false,
          message: 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không (http://localhost:3000)',
        };
      }
      
      const errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    characterName: string,
    talentId?: number,
  ) => {
    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        characterName,
        talentId,
      });
      // api is axios instance, so response.data contains the actual data
      const { user, character, token } = response.data;

      authState.value = { user, character, token };
      localStorage.setItem('token', token);

      return { success: true, user, character };
    } catch (error: any) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Đăng ký thất bại',
      };
    }
  };

  const logout = () => {
    authState.value = { user: null, character: null, token: null };
    localStorage.removeItem('token');
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }

    try {
      // api is axios instance, so response.data contains the actual data
      const response = await api.get('/auth/me');
      console.log('checkAuth response:', response.data);
      
      // Response là User object với characters array
      if (response.data) {
        const userData = response.data;
        authState.value.user = userData;
        
        // Lấy character đầu tiên từ characters array
        if (userData.characters && Array.isArray(userData.characters) && userData.characters.length > 0) {
          authState.value.character = userData.characters[0];
          console.log('Character found in user.characters:', authState.value.character);
        } else {
          console.warn('No characters found in user data:', userData);
          authState.value.character = null;
        }
        
        console.log('AuthState updated:', {
          user: authState.value.user,
          character: authState.value.character,
          hasCharacters: !!userData.characters,
          charactersCount: userData.characters?.length || 0,
        });
      }
      return true;
    } catch (error) {
      console.error('checkAuth error:', error);
      logout();
      return false;
    }
  };

  // Initialize auth on load
  if (authState.value.token) {
    checkAuth();
  }

  return {
    authState,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    checkAuth,
  };
};

