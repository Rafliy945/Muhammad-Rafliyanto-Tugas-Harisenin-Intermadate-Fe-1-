import axios from "axios";

// api url
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,

});

// --- Get All Movies Data Function ---
export const getMovies = async () => {
  try {
    const response = await apiClient.get("/movies"); 
    return response.data; 
  } catch (error) {
    console.log("Gagal mengambil data film dari API:", error);
    throw error;
  }
};


// --- MyList Function ---
// Get Data MyList
export const getMyList = async () => {
  try {
    const response = await apiClient.get("/mylist");
    return response.data;
  } catch (error) {
    console.log("Gagal mengambil data MyList:", error);
    throw error;
  }
};

// Create Data MyList
export const addMovieToList = async (movieData) => {
  try {
    console.log("movieData1:", movieData);
    const response = await apiClient.post("/mylist", movieData);
    console.log("movieData2:", movieData);
    console.log("response:", response);
    return response.data;
  } catch (error) {
    console.log("gagal menambahkan ke MyList:", error);
    throw error;
  }
};

// Update Data isWatched status
export const updateWatchedStatus = async (itemId, updatedData) => {
  try {
    console.log("itemId:", itemId);
    console.log("updatedData:", updatedData);
    const response = await apiClient.put(`/mylist/${itemId}`, updatedData);
    // console.log("RESPONSE WOYY:", response);
    return response.data;
  } catch (error) {
    console.log(`Gagal memperbarui status item ${itemId}:`, error);
    throw error;
  }
};

// Delete movie from MyList
export const removeMovieFromList = async (itemId) => {
  try {
    const response = await apiClient.delete(`/mylist/${itemId}`);
    return response.data;
  } catch (error) {
    console.log(`Gagal menghapus item ${itemId}`, error);
    throw error;
  }
};