import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { FiFilter } from 'react-icons/fi';
import MovieCard from '../components/MovieCard';
import { getGenres, getMoviesByGenre } from '../services/api';

const GenresPage = () => {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('popularity.desc');
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Fetch all genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreData = await getGenres();
        setGenres(genreData);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    fetchGenres();
  }, []);

  // Fetch movies by genre
  useEffect(() => {
    if (!selectedGenre) return;
    
    const fetchMoviesBySelectedGenre = async () => {
      setIsLoading(true);
      try {
        const { results, totalPages: total } = await getMoviesByGenre(
          selectedGenre.id,
          page,
          sortBy
        );
        
        if (page === 1) {
          setMovies(results);
        } else {
          setMovies(prev => [...prev, ...results]);
        }
        
        setTotalPages(total);
      } catch (error) {
        console.error('Error fetching movies by genre:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMoviesBySelectedGenre();
  }, [selectedGenre, page, sortBy]);

  // Load more when scrolling to the bottom
  useEffect(() => {
    if (inView && !isLoading && page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [inView, isLoading, page, totalPages]);

  // Reset page when genre or sort changes
  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    setPage(1);
    setMovies([]);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
    setMovies([]);
  };

  const sortOptions = [
    { value: 'popularity.desc', label: 'Popularity (High to Low)' },
    { value: 'popularity.asc', label: 'Popularity (Low to High)' },
    { value: 'vote_average.desc', label: 'Rating (High to Low)' },
    { value: 'vote_average.asc', label: 'Rating (Low to High)' },
    { value: 'release_date.desc', label: 'Release Date (Newest)' },
    { value: 'release_date.asc', label: 'Release Date (Oldest)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Movie Genres
      </h1>
      
      {/* Genres filter */}
      <div className="mb-8 overflow-x-auto pb-2 hide-scrollbar">
        <div className="flex space-x-2">
          {genres.map(genre => (
            <button
              key={genre.id}
              onClick={() => handleGenreSelect(genre)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedGenre?.id === genre.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
      
      {selectedGenre ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedGenre.name} Movies
            </h2>
            
            {/* Sort options */}
            <div className="flex items-center">
              <FiFilter className="mr-2 text-gray-500 dark:text-gray-400" />
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Movie grid */}
          {movies.length > 0 ? (
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {movies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </motion.div>
          ) : !isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-700 dark:text-gray-300">
                No movies found in this genre.
              </p>
            </div>
          ) : null}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center my-8">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Infinite scroll trigger */}
          {!isLoading && movies.length > 0 && page < totalPages && (
            <div ref={ref} className="h-20 flex items-center justify-center">
              <div className="w-8 h-8 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            Select a genre to explore movies.
          </p>
        </div>
      )}
    </div>
  );
};

export default GenresPage;
