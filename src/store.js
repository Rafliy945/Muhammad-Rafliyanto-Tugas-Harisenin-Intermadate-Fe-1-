
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // ==================== USER STATE ====================
      user: null,
      isAuthenticated: false,
      
      // ==================== PAGE STATE ====================
      currentPage: 'home',
      
      // ==================== MOVIE/CONTENT STATE ====================
      favorites: [],
      watchlist: [],
      continueWatching: [],
      recentlyWatched: [],
      
      // ==================== UI STATE ====================
      isLoading: false,
      searchQuery: '',
      selectedGenre: null,
      
      // ==================== USER ACTIONS ====================
      setUser: (userData) => set({ 
        user: userData, 
        isAuthenticated: !!userData 
      }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false,
        favorites: [],
        watchlist: [],
        continueWatching: [],
        currentPage: 'home'
      }),
      
      // ==================== PAGE NAVIGATION ====================
      setCurrentPage: (page) => set({ currentPage: page }),
      
      goToHome: () => set({ currentPage: 'home' }),
      goToLogin: () => set({ currentPage: 'login' }),
      goToRegister: () => set({ currentPage: 'register' }),
      goToProfile: () => set({ currentPage: 'profile' }),
      goToPremium: () => set({ currentPage: 'premium' }),
      
      // ==================== FAVORITES ACTIONS ====================
      addToFavorites: (movie) => set((state) => {
        const exists = state.favorites.find(m => m.id === movie.id);
        if (exists) return state;
        return { favorites: [...state.favorites, movie] };
      }),
      
      removeFromFavorites: (movieId) => set((state) => ({
        favorites: state.favorites.filter(m => m.id !== movieId)
      })),
      
      toggleFavorite: (movie) => set((state) => {
        const exists = state.favorites.find(m => m.id === movie.id);
        if (exists) {
          return { favorites: state.favorites.filter(m => m.id !== movie.id) };
        }
        return { favorites: [...state.favorites, movie] };
      }),
      
      isFavorite: (movieId) => {
        return get().favorites.some(m => m.id === movieId);
      },
      
      // ==================== WATCHLIST ACTIONS ====================
      addToWatchlist: (movie) => set((state) => {
        const exists = state.watchlist.find(m => m.id === movie.id);
        if (exists) return state;
        return { watchlist: [...state.watchlist, movie] };
      }),
      
      removeFromWatchlist: (movieId) => set((state) => ({
        watchlist: state.watchlist.filter(m => m.id !== movieId)
      })),
      
      toggleWatchlist: (movie) => set((state) => {
        const exists = state.watchlist.find(m => m.id === movie.id);
        if (exists) {
          return { watchlist: state.watchlist.filter(m => m.id !== movie.id) };
        }
        return { watchlist: [...state.watchlist, movie] };
      }),
      
      isInWatchlist: (movieId) => {
        return get().watchlist.some(m => m.id === movieId);
      },
      
      // ==================== CONTINUE WATCHING ACTIONS ====================
      addToContinueWatching: (movie, progress = 0) => set((state) => {
        const filtered = state.continueWatching.filter(m => m.id !== movie.id);
        const movieWithProgress = { 
          ...movie, 
          progress, 
          lastWatched: new Date().toISOString() 
        };
        return { 
          continueWatching: [movieWithProgress, ...filtered].slice(0, 10) 
        };
      }),
      
      updateWatchProgress: (movieId, progress) => set((state) => ({
        continueWatching: state.continueWatching.map(m => 
          m.id === movieId 
            ? { ...m, progress, lastWatched: new Date().toISOString() }
            : m
        )
      })),
      
      removeFromContinueWatching: (movieId) => set((state) => ({
        continueWatching: state.continueWatching.filter(m => m.id !== movieId)
      })),
      
      clearContinueWatching: () => set({ continueWatching: [] }),
      
      // ==================== RECENTLY WATCHED ACTIONS ====================
      addToRecentlyWatched: (movie) => set((state) => {
        const filtered = state.recentlyWatched.filter(m => m.id !== movie.id);
        const movieWithTimestamp = { 
          ...movie, 
          watchedAt: new Date().toISOString() 
        };
        return { 
          recentlyWatched: [movieWithTimestamp, ...filtered].slice(0, 20) 
        };
      }),
      
      clearRecentlyWatched: () => set({ recentlyWatched: [] }),
      
      // ==================== UI ACTIONS ====================
      setLoading: (loading) => set({ isLoading: loading }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setSelectedGenre: (genre) => set({ selectedGenre: genre }),
      
      clearSearch: () => set({ searchQuery: '', selectedGenre: null }),
      
      // ==================== PREMIUM ACTIONS ====================
      upgradeToPremium: () => set((state) => ({
        user: state.user ? { ...state.user, premium: true } : null
      })),
      
      cancelPremium: () => set((state) => ({
        user: state.user ? { ...state.user, premium: false } : null
      })),
      
      isPremium: () => {
        return get().user?.premium || false;
      },
      
      // ==================== GETTER METHODS ====================
      getUser: () => get().user,
      
      getUserEmail: () => get().user?.email || '',
      
      getUserName: () => get().user?.username || 'Guest',
      
      getFavoritesCount: () => get().favorites.length,
      
      getWatchlistCount: () => get().watchlist.length,
      
      // ==================== UTILITY ACTIONS ====================
      resetStore: () => set({
        user: null,
        isAuthenticated: false,
        currentPage: 'home',
        favorites: [],
        watchlist: [],
        continueWatching: [],
        recentlyWatched: [],
        isLoading: false,
        searchQuery: '',
        selectedGenre: null,
      }),
      
      // Clear user-specific data (keep page state)
      clearUserData: () => set({
        favorites: [],
        watchlist: [],
        continueWatching: [],
        recentlyWatched: [],
      }),
    }),
    {
      name: 'chill-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        currentPage: state.currentPage,
        favorites: state.favorites,
        watchlist: state.watchlist,
        continueWatching: state.continueWatching,
        recentlyWatched: state.recentlyWatched,
      }),
    }
  )
);

export default useStore;