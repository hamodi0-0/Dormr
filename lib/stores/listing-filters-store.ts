import { create } from "zustand";
import type { RoomType, GenderPreference } from "@/lib/types/listing";

// Re-export so existing imports like `import type { RoomType } from "@/lib/stores/listing-filters-store"` keep working
export type { RoomType, GenderPreference };

interface ListingFiltersState {
  searchQuery: string;
  roomType: RoomType | null;
  maxPrice: number | null;
  amenities: string[];
  genderPreference: GenderPreference | null;
  university: string | null;

  setSearchQuery: (query: string) => void;
  setRoomType: (roomType: RoomType | null) => void;
  setMaxPrice: (price: number | null) => void;
  toggleAmenity: (amenity: string) => void;
  setGenderPreference: (pref: GenderPreference | null) => void;
  setUniversity: (university: string | null) => void;
  resetFilters: () => void;
}

const initialState = {
  searchQuery: "",
  roomType: null as RoomType | null,
  maxPrice: null as number | null,
  amenities: [] as string[],
  genderPreference: null as GenderPreference | null,
  university: null as string | null,
};

export const useListingFilters = create<ListingFiltersState>((set) => ({
  ...initialState,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setRoomType: (roomType) => set({ roomType }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  toggleAmenity: (amenity) =>
    set((state) => ({
      amenities: state.amenities.includes(amenity)
        ? state.amenities.filter((a) => a !== amenity)
        : [...state.amenities, amenity],
    })),
  setGenderPreference: (genderPreference) => set({ genderPreference }),
  setUniversity: (university) => set({ university }),
  resetFilters: () => set(initialState),
}));
