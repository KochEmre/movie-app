import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import MovieCard from './MovieCard';

const MovieSlider = ({ title, movies, icon, viewAllLink }) => {
  const sliderRef = useRef(null);

  const scroll = (direction) => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollTo = direction === 'left'
        ? scrollLeft - clientWidth * 0.75
        : scrollLeft + clientWidth * 0.75;

      sliderRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  if (!movies || movies.length === 0) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {icon && <span className="mr-2">{icon}</span>}
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-[160px] aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-lg skeleton"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
        </div>

        <div className="flex items-center">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mr-4"
            >
              View All
            </Link>
          )}

          <div className="flex space-x-2">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              aria-label="Scroll left"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              aria-label="Scroll right"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <motion.div
          ref={sliderRef}
          className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar"
          whileTap={{ cursor: "grabbing" }}
        >
          {movies.map(movie => (
            <MovieCard
              key={movie.id}
              movie={movie}
              variant="small"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default MovieSlider;
