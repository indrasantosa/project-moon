import { getHousingSearchProfiles } from '@/lib/utils/data';
import {create} from 'zustand';

interface SearchStoreInterface {
  isSearching: boolean;
  searchResults: HousingSearchProfile[];
  search: (searcherProfilesFilter: SearcherProfilesFilterType) => Promise<void>;
}

export const useSearchStore = create<SearchStoreInterface>((set) => ({
  isSearching: false,
  searchResults: [],
  
  search: async (searcherProfilesFilter: SearcherProfilesFilterType) => {
    set({ isSearching: true });
    try {
      const profiles = await getHousingSearchProfiles(0, 25, searcherProfilesFilter);
      set({ searchResults: profiles });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isSearching: false });
    }
  },
}));