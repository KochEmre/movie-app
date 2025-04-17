import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlay, FaInfoCircle, FaStar, FaChevronLeft, FaChevronRight, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useFavorites } from '../contexts/FavoritesContext';
import { useWatchlist } from '../contexts/WatchlistContext';
import { getTrendingMovies, getBackdropUrl } from '../services/api';
import MovieModal from './MovieModal';

const Hero = () => {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchFeaturedMovies = async () => {
      setIsLoading(true);
      try {
        const movies = await getTrendingMovies();
        // Get trending movies with backdrop images
        const moviesWithBackdrops = movies
          .filter(movie => movie.backdrop_path);

        if (moviesWithBackdrops.length > 0) {
          // Find "The Woman in the Yard" movie if it exists
          const womanInYardIndex = moviesWithBackdrops.findIndex(
            movie => movie.title.toLowerCase().includes("woman in the yard")
          );

          // If the movie exists, move it to the first position
          if (womanInYardIndex !== -1) {
            const womanInYardMovie = moviesWithBackdrops[womanInYardIndex];
            moviesWithBackdrops.splice(womanInYardIndex, 1);
            moviesWithBackdrops.unshift(womanInYardMovie);
          }

          // Take only the first 5 movies
          setFeaturedMovies(moviesWithBackdrops.slice(0, 5));
        } else {
          // Fallback if no movies with backdrops
          setFeaturedMovies([{
            id: 1,
            title: "Featured Movie",
            backdrop_path: null,
            overview: "Movie description would go here.",
            vote_average: 8.5,
            release_date: "2023-01-01"
          }]);
        }
      } catch (error) {
        console.error('Error fetching featured movies:', error);
        // Set a fallback featured movie
        setFeaturedMovies([{
          id: 1,
          title: "Featured Movie",
          backdrop_path: null,
          overview: "Movie description would go here.",
          vote_average: 8.5,
          release_date: "2023-01-01"
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedMovies();
  }, []);

  // Auto-rotate featured movies
  useEffect(() => {
    if (featuredMovies.length === 0 || isModalOpen) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex =>
        prevIndex === featuredMovies.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [featuredMovies, isModalOpen]);

  // Handle manual navigation
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Navigate to previous or next slide
  const navigateSlide = (direction) => {
    if (direction === 'prev') {
      setCurrentIndex(prevIndex =>
        prevIndex === 0 ? featuredMovies.length - 1 : prevIndex - 1
      );
    } else {
      setCurrentIndex(prevIndex =>
        prevIndex === featuredMovies.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  // Handle favorite button click
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    const movie = featuredMovies[currentIndex];

    if (isFavorite(movie.id)) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }
  };

  // Handle watchlist button click
  const handleWatchlistClick = (e) => {
    e.preventDefault();
    const movie = featuredMovies[currentIndex];

    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  if (isLoading || featuredMovies.length === 0) {
    return (
      <div className="w-full h-[70vh] bg-gray-900 animate-pulse flex items-center justify-center">
        <div className="text-white opacity-50">Loading featured movies...</div>
      </div>
    );
  }

  const currentMovie = featuredMovies[currentIndex];

  return (
    <div className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden">
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10" />
        {currentMovie.backdrop_path ? (
          <motion.img
            key={currentMovie.id}
            src={getBackdropUrl(currentMovie.backdrop_path)}
            alt={currentMovie.title}
            className="w-full h-full object-cover object-center"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/1920x1080/darkgray/white?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-900 to-purple-900"></div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            {currentMovie.title}
          </h1>

          <div className="flex items-center mb-4 text-sm">
            <div className="flex items-center text-yellow-400 mr-4">
              <FaStar className="mr-1" />
              <span>{currentMovie.vote_average.toFixed(1)}</span>
            </div>
            <span className="text-gray-300 mr-4">
              {new Date(currentMovie.release_date).getFullYear()}
            </span>
            {currentMovie.adult && (
              <span className="bg-red-600 text-white px-2 py-0.5 text-xs rounded">
                18+
              </span>
            )}
          </div>

          <p className="text-gray-300 mb-6 line-clamp-3">
            {currentMovie.overview}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to={`/`}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center transition-colors"
            >
              <FaPlay className="mr-2" />
              Watch Now
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-gray-800/80 hover:bg-gray-700 text-white rounded-full flex items-center transition-colors"
            >
              <FaInfoCircle className="mr-2" />
              More Info
            </button>

            {/* Favorite button */}
            <button
              onClick={handleFavoriteClick}
              className="p-3 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white flex items-center transition-colors"
              aria-label={isFavorite(currentMovie.id) ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite(currentMovie.id) ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart />
              )}
            </button>

            {/* Watchlist button */}
            <button
              onClick={handleWatchlistClick}
              className="p-3 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white flex items-center transition-colors"
              aria-label={isInWatchlist(currentMovie.id) ? "Remove from watchlist" : "Add to watchlist"}
            >
              {isInWatchlist(currentMovie.id) ? (
                <FaBookmark className="text-blue-500" />
              ) : (
                <FaRegBookmark />
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Navigation arrows - hidden when modal is open */}
      {!isModalOpen && (
        <>
          <button
            onClick={() => navigateSlide('prev')}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            aria-label="Previous slide"
          >
            <FaChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigateSlide('next')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
            aria-label="Next slide"
          >
            <FaChevronRight className="w-5 h-5" />
          </button>

          {/* Slide indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
            {featuredMovies.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-8'
                    : 'bg-gray-400/50 hover:bg-gray-300/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Movie Modal */}
      {isModalOpen && currentMovie && (
        <MovieModal
          movieId={currentMovie.id}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Hero;
