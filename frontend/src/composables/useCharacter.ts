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
    try {
      const response = await api.get('/users');
      console.log('Users API response:', response.data);
      const user = response.data[0];
      if (user && user.characters && user.characters.length > 0) {
        character.value = user.characters[0];
        console.log('Character loaded:', character.value);
      } else {
        console.warn('No characters found for user:', user);
      }
    } catch (error: any) {
      console.error('Error fetching character:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
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

