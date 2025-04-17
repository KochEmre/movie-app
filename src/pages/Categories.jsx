import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import MovieCard from '../components/MovieCard';
import Spinner from '../components/Spinner';

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_IMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const Categories = () => {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('popularity.desc');
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Türleri getir
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/genre/movie/list`,
          API_OPTIONS
        );
        const data = await response.json();
        setGenres(data.genres || []);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };

    fetchGenres();
  }, []);

  // Filmleri getir
  useEffect(() => {
    const fetchMoviesByGenre = async () => {
      if (!selectedGenre) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/discover/movie?with_genres=${selectedGenre.id}&sort_by=${sortBy}&page=${page}`,
          API_OPTIONS
        );
        const data = await response.json();
        
        if (page === 1) {
          setMovies(data.results || []);
        } else {
          setMovies(prev => [...prev, ...(data.results || [])]);
        }
        
        setTotalPages(data.total_pages);
      } catch (error) {
        console.error("Error fetching movies by genre:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoviesByGenre();
  }, [selectedGenre, page, sortBy]);

  // Sonsuz kaydırma için
  useEffect(() => {
    if (inView && !isLoading && page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [inView, isLoading, page, totalPages]);

  // Tür değiştiğinde sayfayı sıfırla
  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    setPage(1);
    setMovies([]);
  };

  // Sıralama değiştiğinde sayfayı sıfırla
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
    setMovies([]);
  };

  const sortOptions = [
    { value: 'popularity.desc', label: 'Popülerlik (Azalan)' },
    { value: 'popularity.asc', label: 'Popülerlik (Artan)' },
    { value: 'vote_average.desc', label: 'Puan (Azalan)' },
    { value: 'vote_average.asc', label: 'Puan (Artan)' },
    { value: 'release_date.desc', label: 'Yayın Tarihi (Yeni)' },
    { value: 'release_date.asc', label: 'Yayın Tarihi (Eski)' },
  ];

  return (
    <div className="wrapper py-6">
      <h1 className="text-3xl font-bold text-white mb-8">Film Kategorileri</h1>
      
      {/* Türler */}
      <div className="mb-8 overflow-x-auto hide-scrollbar">
        <div className="flex space-x-2 pb-2">
          {genres.map(genre => (
            <button
              key={genre.id}
              onClick={() => handleGenreSelect(genre)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedGenre?.id === genre.id
                  ? 'bg-light-100/30 dark:bg-indigo-600 text-white'
                  : 'bg-light-100/10 dark:bg-gray-800 text-gray-300 hover:bg-light-100/20 dark:hover:bg-gray-700'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
      
      {selectedGenre ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {selectedGenre.name} Filmleri
            </h2>
            
            {/* Sıralama seçenekleri */}
            <div className="flex items-center">
              <label htmlFor="sort" className="text-gray-300 mr-2">Sırala:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={handleSortChange}
                className="bg-light-100/10 dark:bg-gray-800 text-white rounded-md px-3 py-1 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Film listesi */}
          {movies.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {movies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </motion.div>
          ) : !isLoading ? (
            <p className="text-gray-300 text-center py-12">Bu kategoride film bulunamadı.</p>
          ) : null}
          
          {/* Yükleme göstergesi ve sonsuz kaydırma için referans */}
          {isLoading && (
            <div className="flex justify-center my-8">
              <Spinner />
            </div>
          )}
          
          {!isLoading && movies.length > 0 && page < totalPages && (
            <div ref={ref} className="h-20 flex items-center justify-center">
              <div className="w-8 h-8 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-300 text-lg">Filmlerini görmek için bir kategori seçin.</p>
        </div>
      )}
    </div>
  );
};

export default Categories;
