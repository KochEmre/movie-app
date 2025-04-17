import { useState, useEffect } from 'react';
import { FiTrendingUp, FiStar, FiCalendar, FiAward } from 'react-icons/fi';
import Hero from '../components/Hero';
import MovieSlider from '../components/MovieSlider';
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies
} from '../services/api';

const HomePage = () => {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      try {
        // Fetch all movie categories in parallel
        const [trending, popular, topRated, upcoming] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getTopRatedMovies(),
          getUpcomingMovies()
        ]);

        setTrendingMovies(trending);
        setPopularMovies(popular);
        setTopRatedMovies(topRated);
        setUpcomingMovies(upcoming);
      } catch (error) {
        console.error('Error fetching movies:', error);
        // Set empty arrays as fallback
        setTrendingMovies([]);
        setPopularMovies([]);
        setTopRatedMovies([]);
        setUpcomingMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div>
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300">Loading movies...</p>
          </div>
        ) : (
          <>
            <MovieSlider
              title="Trending Now"
              movies={trendingMovies}
              icon={<FiTrendingUp className="text-red-500" />}
              viewAllLink="/category/trending"
            />

            <MovieSlider
              title="Popular Movies"
              movies={popularMovies}
              icon={<FiStar className="text-yellow-500" />}
              viewAllLink="/category/popular"
            />

            <MovieSlider
              title="Top Rated"
              movies={topRatedMovies}
              icon={<FiAward className="text-blue-500" />}
              viewAllLink="/category/top-rated"
            />

            <MovieSlider
              title="Coming Soon"
              movies={upcomingMovies}
              icon={<FiCalendar className="text-green-500" />}
              viewAllLink="/category/upcoming"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
