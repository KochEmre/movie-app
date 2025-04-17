import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import MovieCard from '../components/MovieCard';
import { searchMovies } from '../services/api';

const SearchPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  
  const [searchTerm, setSearchTerm] = useState(query);
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Update URL without reloading the page
      const newUrl = `/search?q=${encodeURIComponent(searchTerm)}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
      
      // Reset and search
      setPage(1);
      setMovies([]);
      fetchMovies(searchTerm, 1);
    }
  };

  // Fetch movies based on search term
  const fetchMovies = async (term, pageNum) => {
    if (!term) return;
    
    setIsLoading(true);
    try {
      const { results, totalPages: total, totalResults: count } = await searchMovies(term, pageNum);
      
      if (pageNum === 1) {
        setMovies(results);
      } else {
        setMovies(prev => [...prev, ...results]);
      }
      
      setTotalPages(total);
      setTotalResults(count);
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial search based on URL query
  useEffect(() => {
    if (query) {
      setSearchTerm(query);
      fetchMovies(query, 1);
    }
  }, [query]);

  // Load more when scrolling to the bottom
  useEffect(() => {
    if (inView && !isLoading && page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [inView, isLoading, page, totalPages]);

  // Fetch more movies when page changes
  useEffect(() => {
    if (page > 1 && searchTerm) {
      fetchMovies(searchTerm, page);
    }
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Search Movies
      </h1>
      
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-2xl mx-auto">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search for movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-300"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            Search
          </button>
        </div>
      </form>
      
      {/* Search results */}
      {query && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {totalResults > 0 
              ? `Found ${totalResults} results for "${query}"`
              : `No results found for "${query}"`
            }
          </h2>
        </div>
      )}
      
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
      ) : query && !isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-700 dark:text-gray-300 text-lg">
            No movies found matching your search.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Try different keywords or check for typos.
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
    </div>
  );
};

export default SearchPage;
