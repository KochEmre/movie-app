import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaStar, FaPlay, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { getMovieDetails, getBackdropUrl } from '../services/api';
import { useFavorites } from '../contexts/FavoritesContext';
import { useWatchlist } from '../contexts/WatchlistContext';

const MovieModal = ({ movieId, onClose }) => {
  const [movie, setMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!movieId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getMovieDetails(movieId);
        setMovie(data);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();

    // Add event listener to close modal on escape key
    const handleEscKey = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEscKey);

    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [movieId, onClose]);

  // Handle favorite button click
  const handleFavoriteClick = () => {
    if (!movie) return;

    if (isFavorite(movie.id)) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }
  };

  // Handle watchlist button click
  const handleWatchlistClick = () => {
    if (!movie) return;

    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close modal"
          >
            <FaTimes />
          </button>

          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-96 p-6 text-center">
              <p className="text-red-500 dark:text-red-400 text-lg mb-4">{error}</p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          ) : movie ? (
            <>
              {/* Backdrop image */}
              <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-t-lg">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10" />
                {movie.backdrop_path ? (
                  <img
                    src={getBackdropUrl(movie.backdrop_path)}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/1920x1080/darkgray/white?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-indigo-900 to-purple-900"></div>
                )}

                {/* Movie title overlay */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <h2 className="text-3xl font-bold text-white">{movie.title}</h2>
                  <div className="flex items-center mt-2 text-sm">
                    <div className="flex items-center text-yellow-400 mr-4">
                      <FaStar className="mr-1" />
                      <span>{movie.vote_average?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <span className="text-gray-300 mr-4">
                      {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                    </span>
                    <span className="text-gray-300">
                      {movie.runtime ? `${movie.runtime} min` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Movie content */}
              <div className="p-6">
                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center transition-colors">
                    <FaPlay className="mr-2" />
                    Watch Trailer
                  </button>

                  <button
                    onClick={handleFavoriteClick}
                    className="px-5 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full flex items-center transition-colors"
                    aria-label={isFavorite(movie.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFavorite(movie.id) ? (
                      <>
                        <FaHeart className="text-red-500 mr-2" />
                        <span>In Favorites</span>
                      </>
                    ) : (
                      <>
                        <FaRegHeart className="mr-2" />
                        <span>Add to Favorites</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleWatchlistClick}
                    className="px-5 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-full flex items-center transition-colors"
                    aria-label={isInWatchlist(movie.id) ? "Remove from watchlist" : "Add to watchlist"}
                  >
                    {isInWatchlist(movie.id) ? (
                      <>
                        <FaBookmark className="text-blue-500 mr-2" />
                        <span>In Watchlist</span>
                      </>
                    ) : (
                      <>
                        <FaRegBookmark className="mr-2" />
                        <span>Add to Watchlist</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Overview */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Overview</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    {movie.overview || 'No overview available.'}
                  </p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div>
                    {/* Genres */}
                    {movie.genres && movie.genres.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Genres</h4>
                        <div className="flex flex-wrap gap-2">
                          {movie.genres.map(genre => (
                            <span
                              key={genre.id}
                              className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Release date */}
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Release Date</h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Right column */}
                  <div>
                    {/* Cast */}
                    {movie.credits && movie.credits.cast && movie.credits.cast.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cast</h4>
                        <div className="flex flex-wrap gap-2">
                          {movie.credits.cast.slice(0, 5).map(person => (
                            <span
                              key={person.id}
                              className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                            >
                              {person.name}
                            </span>
                          ))}
                          {movie.credits.cast.length > 5 && (
                            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-sm">
                              +{movie.credits.cast.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Production companies */}
                    {movie.production_companies && movie.production_companies.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Production</h4>
                        <p className="text-gray-700 dark:text-gray-300">
                          {movie.production_companies.map(company => company.name).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MovieModal;
