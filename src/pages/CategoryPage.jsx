import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiStar, FiCalendar, FiAward, FiArrowLeft } from 'react-icons/fi';
import MovieCard from '../components/MovieCard';
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies
} from '../services/api';

// Category configurations
const categories = {
  trending: {
    title: 'Trending Movies',
    icon: <FiTrendingUp className="text-red-500" />,
    fetchFunction: getTrendingMovies
  },
  popular: {
    title: 'Popular Movies',
    icon: <FiStar className="text-yellow-500" />,
    fetchFunction: getPopularMovies
  },
  'top-rated': {
    title: 'Top Rated Movies',
    icon: <FiAward className="text-blue-500" />,
    fetchFunction: getTopRatedMovies
  },
  upcoming: {
    title: 'Coming Soon',
    icon: <FiCalendar className="text-green-500" />,
    fetchFunction: getUpcomingMovies
  }
};

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      const categoryConfig = categories[category];
      if (!categoryConfig) {
        setError('Invalid category');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await categoryConfig.fetchFunction();
        setMovies(data);
      } catch (err) {
        console.error(`Error fetching ${category} movies:`, err);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [category, setError, setIsLoading, setMovies]);

  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };

  const categoryConfig = categories[category];

  if (!categoryConfig) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Category Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">The category you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex items-center mb-8">
        <button
          onClick={handleBack}
          className="mr-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Go back"
        >
          <FiArrowLeft className="text-gray-700 dark:text-gray-300" />
        </button>
        <div className="flex items-center">
          {categoryConfig.icon}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white ml-3">
            {categoryConfig.title}
          </h1>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 dark:text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CategoryPage;
