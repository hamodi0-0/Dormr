import { create } from "zustand";

export type RoomType =
  | "single"
  | "shared"
  | "studio"
  | "entire_apartment"
  | null;
export type GenderPreference =
  | "male_only"
  | "female_only"
  | "no_preference"
  | null;

interface ListingFiltersState {
  searchQuery: string;
  roomType: RoomType;
  maxPrice: number | null;
  amenities: string[];
  genderPreference: GenderPreference;
  university: string | null;

  setSearchQuery: (query: string) => void;
  setRoomType: (roomType: RoomType) => void;
  setMaxPrice: (price: number | null) => void;
  toggleAmenity: (amenity: string) => void;
  setGenderPreference: (pref: GenderPreference) => void;
  setUniversity: (university: string | null) => void;
  resetFilters: () => void;
}

const initialState = {
  searchQuery: "",
  roomType: null as RoomType,
  maxPrice: null as number | null,
  amenities: [] as string[],
  genderPreference: null as GenderPreference,
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
