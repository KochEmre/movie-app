import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaStar } from 'react-icons/fa';
import { useFavorites } from '../contexts/FavoritesContext';
import { useWatchlist } from '../contexts/WatchlistContext';
import { getImageUrl } from '../services/api';

const MovieCard = ({ movie, variant = 'default' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const { id, title, poster_path, vote_average, release_date } = movie;

  // Handle image loading error
  const [imgError, setImgError] = useState(false);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFavorite(id)) {
      removeFromFavorites(id);
    } else {
      addToFavorites(movie);
    }
  };

  const handleWatchlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWatchlist(id)) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist(movie);
    }
  };

  // Placeholder image when poster is not available or fails to load
  const placeholderImage = 'https://placehold.co/500x750/darkgray/white?text=No+Image';

  // Different card styles based on variant
  const cardStyles = {
    default: 'w-full',
    small: 'w-[164px] flex-shrink-0',
    featured: 'w-full md:w-[280px]',
  };

  return (
    <motion.div
      className={`${cardStyles[variant]} relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all duration-300`}
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={imgError ? placeholderImage : getImageUrl(poster_path) || placeholderImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
            onError={() => setImgError(true)}
            loading="lazy"
          />

          {/* Overlay on hover */}
          {isHovered && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-end p-4">
              <div className="flex justify-between mb-2">
                <button
                  onClick={handleFavoriteClick}
                  className="p-2 rounded-full bg-black/50 hover:bg-red-600 transition-colors"
                  aria-label={isFavorite(id) ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite(id) ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart className="text-white" />
                  )}
                </button>

                <button
                  onClick={handleWatchlistClick}
                  className="p-2 rounded-full bg-black/50 hover:bg-blue-600 transition-colors"
                  aria-label={isInWatchlist(id) ? "Remove from watchlist" : "Add to watchlist"}
                >
                  {isInWatchlist(id) ? (
                    <FaBookmark className="text-blue-500" />
                  ) : (
                    <FaRegBookmark className="text-white" />
                  )}
                </button>
              </div>

              <div className="text-white text-sm font-medium">
                View Details
              </div>
            </div>
          )}

          {/* Rating badge */}
          {vote_average > 0 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center">
              <FaStar className="text-yellow-400 mr-1" />
              {vote_average.toFixed(1)}
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{title}</h3>
          {release_date && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {new Date(release_date).getFullYear()}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;
