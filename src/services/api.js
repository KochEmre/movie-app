const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_IMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

// Get trending movies
export const getTrendingMovies = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/trending/movie/day`,
      API_OPTIONS
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    return [];
  }
};

// Get popular movies
export const getPopularMovies = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/movie/popular`,
      API_OPTIONS
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    return [];
  }
};

// Get top rated movies
export const getTopRatedMovies = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/movie/top_rated`,
      API_OPTIONS
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching top rated movies:", error);
    return [];
  }
};

// Get upcoming movies
export const getUpcomingMovies = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/movie/upcoming`,
      API_OPTIONS
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching upcoming movies:", error);
    return [];
  }
};

// Search movies
export const searchMovies = async (query, page = 1) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`,
      API_OPTIONS
    );
    const data = await response.json();
    return {
      results: data.results || [],
      totalPages: data.total_pages || 0,
      totalResults: data.total_results || 0,
    };
  } catch (error) {
    console.error("Error searching movies:", error);
    return { results: [], totalPages: 0, totalResults: 0 };
  }
};

// Get movie details
export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/movie/${movieId}?append_to_response=videos,credits,similar,recommendations`,
      API_OPTIONS
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
};

// Get movies by genre
export const getMoviesByGenre = async (genreId, page = 1, sortBy = 'popularity.desc') => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/discover/movie?with_genres=${genreId}&sort_by=${sortBy}&page=${page}`,
      API_OPTIONS
    );
    const data = await response.json();
    return {
      results: data.results || [],
      totalPages: data.total_pages || 0,
      totalResults: data.total_results || 0,
    };
  } catch (error) {
    console.error("Error fetching movies by genre:", error);
    return { results: [], totalPages: 0, totalResults: 0 };
  }
};

// Get all genres
export const getGenres = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/genre/movie/list`,
      API_OPTIONS
    );
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error("Error fetching genres:", error);
    return [];
  }
};

// Get movie videos
export const getMovieVideos = async (movieId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/movie/${movieId}/videos`,
      API_OPTIONS
    );
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error fetching movie videos:", error);
    return [];
  }
};

// Helper function to get image URL
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Helper function to get backdrop URL
export const getBackdropUrl = (path, size = 'original') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export default {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  searchMovies,
  getMovieDetails,
  getMoviesByGenre,
  getGenres,
  getMovieVideos,
  getImageUrl,
  getBackdropUrl,
};
