import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { FiFilter } from 'react-icons/fi';
import MovieCard from '../components/MovieCard';
import { getPopularMovies, getTopRatedMovies, getTrendingMovies, getUpcomingMovies } from '../services/api';

const MoviesPage = () => {
  const [activeTab, setActiveTab] = useState('popular');
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Fetch movies based on active tab
  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        let results = [];
        
        switch (activeTab) {
          case 'popular':
            results = await getPopularMovies();
            break;
          case 'top_rated':
            results = await getTopRatedMovies();
            break;
          case 'trending':
            results = await getTrendingMovies();
            break;
          case 'upcoming':
            results = await getUpcomingMovies();
            break;
          default:
            results = await getPopularMovies();
        }
        
        setMovies(results);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setPage(1);
    fetchMovies();
  }, [activeTab]);

  // Get tab title
  const getTabTitle = () => {
    switch (activeTab) {
      case 'popular':
        return 'Popular Movies';
      case 'top_rated':
        return 'Top Rated Movies';
      case 'trending':
        return 'Trending Movies';
      case 'upcoming':
        return 'Upcoming Movies';
      default:
        return 'Movies';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {getTabTitle()}
      </h1>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveTab('popular')}
          className={`px-4 py-2 rounded-full transition-colors ${
            activeTab === 'popular'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Popular
        </button>
        <button
          onClick={() => setActiveTab('top_rated')}
          className={`px-4 py-2 rounded-full transition-colors ${
            activeTab === 'top_rated'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Top Rated
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 rounded-full transition-colors ${
            activeTab === 'trending'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Trending
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-full transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          Upcoming
        </button>
      </div>
      
      {/* Movie grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : movies.length > 0 ? (
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          key={activeTab} // Force re-render on tab change
        >
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            No movies found.
          </p>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;
