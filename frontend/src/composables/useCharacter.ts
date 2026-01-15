import { ref, computed } from 'vue';
import { api } from './useApi';
import { formatRealm } from '../utils/realm';

export interface Character {
  id: number;
  display_name: string;
  realm_level: number;
  exp: number;
  strength: number;
  agility: number;
  wisdom: number;
}

export const useCharacter = () => {
  const character = ref<Character | null>(null);
  const loading = ref(true);

  const fetchCharacter = async () => {
    loading.value = true;
    try {
      // Thêm timeout để tránh hang mãi
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 2 minutes')), 120000);
      });
      
      // Dùng /auth/me để lấy thông tin user và character hiện tại
      const apiPromise = api.get('/auth/me');
      const response = await Promise.race([apiPromise, timeoutPromise]) as any;
      
      console.log('Auth/me API response:', response.data);
      
      // Response là User object với characters array
      if (response.data) {
        const userData = response.data;
        
        // Lấy character đầu tiên từ characters array
        if (userData.characters && Array.isArray(userData.characters) && userData.characters.length > 0) {
          character.value = userData.characters[0];
          console.log('✅ Character loaded from /auth/me:', character.value);
        } else {
          console.warn('❌ No characters found in user data:', {
            hasCharacters: !!userData.characters,
            charactersType: typeof userData.characters,
            charactersValue: userData.characters,
            userData,
          });
          character.value = null;
        }
      }
    } catch (error: any) {
      console.error('Error fetching character:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      // Đảm bảo loading được set false ngay cả khi có lỗi
      character.value = null;
    } finally {
      loading.value = false;
    }
  };

  const realmDisplay = computed(() => {
    if (!character.value) return '';
    return formatRealm(character.value.realm_level);
  });

  return {
    character,
    loading,
    fetchCharacter,
    realmDisplay,
  };
};

