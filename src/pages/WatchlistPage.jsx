import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiTrash2, FiFilter } from 'react-icons/fi';
import { useWatchlist } from '../contexts/WatchlistContext';
import MovieCard from '../components/MovieCard';

const WatchlistPage = () => {
  const { watchlist, removeFromWatchlist } = useWatchlist();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_added');

  // Filter and sort watchlist
  const filteredWatchlist = watchlist
    .filter(movie => 
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        case 'rating_desc':
          return (b.vote_average || 0) - (a.vote_average || 0);
        case 'rating_asc':
          return (a.vote_average || 0) - (b.vote_average || 0);
        case 'year_desc':
          return (b.release_date?.split('-')[0] || 0) - (a.release_date?.split('-')[0] || 0);
        case 'year_asc':
          return (a.release_date?.split('-')[0] || 0) - (b.release_date?.split('-')[0] || 0);
        case 'date_added':
        default:
          return 0; // Keep original order
      }
    });

  // Clear all watchlist
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your entire watchlist?')) {
      watchlist.forEach(movie => removeFromWatchlist(movie.id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        My Watchlist
      </h1>
      
      {watchlist.length > 0 ? (
        <>
          {/* Search and sort controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="relative w-full md:w-auto">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search your watchlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-300"
              />
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center">
                <FiFilter className="mr-2 text-gray-500 dark:text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="date_added">Date Added</option>
                  <option value="title_asc">Title (A-Z)</option>
                  <option value="title_desc">Title (Z-A)</option>
                  <option value="rating_desc">Rating (High to Low)</option>
                  <option value="rating_asc">Rating (Low to High)</option>
                  <option value="year_desc">Year (Newest)</option>
                  <option value="year_asc">Year (Oldest)</option>
                </select>
              </div>
              
              <button
                onClick={handleClearAll}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                <FiTrash2 />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            </div>
          </div>
          
          {/* Movie grid */}
          {filteredWatchlist.length > 0 ? (
            <AnimatePresence>
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {filteredWatchlist.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                No movies match your search for "{searchTerm}".
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
            Your watchlist is empty.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Explore movies and click the bookmark icon to add them to your watchlist.
          </p>
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
