import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { FaChevronLeft, FaChevronRight, FaFire, FaStar, FaCalendarAlt } from "react-icons/fa";
import Search from "../components/Search";
import Spinner from "../components/Spinner";
import MovieCard from "../components/MovieCard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "../appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_IMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasNewResults, setHasNewResults] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  const resultsRef = useRef(null);
  const trendingSliderRef = useRef(null);
  
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Debounce the search term to prevent making too many API requests
  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset page when search term changes
    },
    500,
    [searchTerm]
  );

  const fetchMovies = async (query = "", currentPage = 1) => {
    setIsLoading(true);
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${currentPage}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${currentPage}`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }
      const data = await response.json();

      if (data.success === "False") {
        setErrorMessage(data.status_message || "Error fetching movies");
        setMovieList([]);
        return;
      }

      if (currentPage === 1) {
        setMovieList(data.results || []);
      } else {
        setMovieList(prev => [...prev, ...(data.results || [])]);
      }
      
      setTotalPages(data.total_pages);
      
      if (query && data.results.length > 0 && currentPage === 1) {
        await updateSearchCount(query, data.results[0]);
        setHasNewResults(true);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };
  
  const fetchPopularMovies = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/movie/popular`,
        API_OPTIONS
      );
      const data = await response.json();
      setPopularMovies(data.results || []);
    } catch (error) {
      console.error(`Error fetching popular movies: ${error}`);
    }
  };
  
  const fetchTopRatedMovies = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/movie/top_rated`,
        API_OPTIONS
      );
      const data = await response.json();
      setTopRatedMovies(data.results || []);
    } catch (error) {
      console.error(`Error fetching top rated movies: ${error}`);
    }
  };
  
  const fetchUpcomingMovies = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/movie/upcoming`,
        API_OPTIONS
      );
      const data = await response.json();
      setUpcomingMovies(data.results || []);
    } catch (error) {
      console.error(`Error fetching upcoming movies: ${error}`);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm, 1);
  }, [debouncedSearchTerm]);
  
  // Load more movies when scrolling
  useEffect(() => {
    if (inView && !isLoading && page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [inView, isLoading, page, totalPages]);
  
  // Fetch more movies when page changes
  useEffect(() => {
    if (page > 1) {
      fetchMovies(debouncedSearchTerm, page);
    }
  }, [page]);

  // Scroll to results when new results are loaded
  useEffect(() => {
    if (hasNewResults && resultsRef.current && !isLoading && movieList.length > 0) {
      // Scroll to results with smooth behavior
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Reset the flag
      setHasNewResults(false);
    }
  }, [hasNewResults, isLoading, movieList]);

  useEffect(() => {
    loadTrendingMovies();
    fetchPopularMovies();
    fetchTopRatedMovies();
    fetchUpcomingMovies();
  }, []);
  
  // Trending slider navigation
  const scrollTrending = (direction) => {
    if (trendingSliderRef.current) {
      const { scrollLeft, clientWidth } = trendingSliderRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2
        : scrollLeft + clientWidth / 2;
        
      trendingSliderRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };
  
  // Movie section component
  const MovieSection = ({ title, movies, icon }) => {
    const [sliderRef, setSliderRef] = useState(null);
    
    const scroll = (direction) => {
      if (sliderRef) {
        const { scrollLeft, clientWidth } = sliderRef;
        const scrollTo = direction === 'left' 
          ? scrollLeft - clientWidth / 1.5
          : scrollLeft + clientWidth / 1.5;
          
        sliderRef.scrollTo({
          left: scrollTo,
          behavior: 'smooth'
        });
      }
    };
    
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {icon}
            <h2 className="text-2xl font-bold text-white ml-2">{title}</h2>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-light-100/10 dark:bg-gray-800 text-white hover:bg-light-100/20 dark:hover:bg-gray-700 transition-colors"
              aria-label="Scroll left"
            >
              <FaChevronLeft />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-light-100/10 dark:bg-gray-800 text-white hover:bg-light-100/20 dark:hover:bg-gray-700 transition-colors"
              aria-label="Scroll right"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        
        <div 
          ref={setSliderRef}
          className="flex overflow-x-auto space-x-4 pb-4 hide-scrollbar"
        >
          {movies.map(movie => (
            <div key={movie.id} className="flex-shrink-0 w-[180px] sm:w-[220px]">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="wrapper">
      <header className="mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src="./hero.webp" alt="Hero Banner" className="w-full max-w-lg h-auto object-contain mx-auto drop-shadow-md" />
          <h1 className="mx-auto max-w-4xl text-center text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white mt-4 mb-8">
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} isLoading={isLoading && debouncedSearchTerm === searchTerm} />
        </motion.div>
      </header>

      {!searchTerm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {trendingMovies.length > 0 && (
            <section className="trending mb-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Trending Searches</h2>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => scrollTrending('left')}
                    className="p-2 rounded-full bg-light-100/10 dark:bg-gray-800 text-white hover:bg-light-100/20 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Scroll left"
                  >
                    <FaChevronLeft />
                  </button>
                  <button 
                    onClick={() => scrollTrending('right')}
                    className="p-2 rounded-full bg-light-100/10 dark:bg-gray-800 text-white hover:bg-light-100/20 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Scroll right"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
              
              <div 
                ref={trendingSliderRef}
                className="flex overflow-x-auto space-x-6 pb-4 hide-scrollbar"
              >
                {trendingMovies.map((movie, index) => (
                  <div key={movie.$id} className="flex-shrink-0 flex items-center space-x-2 min-w-[230px]">
                    <div className="fancy-text text-nowrap">{index+1}</div>
                    <img 
                      src={movie.poster_url} 
                      alt={movie.searchTerm} 
                      className="w-[127px] h-[163px] rounded-lg object-cover transition-all duration-300 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {popularMovies.length > 0 && (
            <MovieSection 
              title="Popular Movies" 
              movies={popularMovies} 
              icon={<FaFire className="text-red-500" />}
            />
          )}
          
          {topRatedMovies.length > 0 && (
            <MovieSection 
              title="Top Rated" 
              movies={topRatedMovies} 
              icon={<FaStar className="text-yellow-500" />}
            />
          )}
          
          {upcomingMovies.length > 0 && (
            <MovieSection 
              title="Coming Soon" 
              movies={upcomingMovies} 
              icon={<FaCalendarAlt className="text-blue-500" />}
            />
          )}
        </motion.div>
      )}

      <section className="all-movies" ref={resultsRef}>
        {searchTerm && (
          <h2 className="text-2xl font-bold text-white mb-6">
            {movieList.length > 0 
              ? `Search Results for "${searchTerm}"`
              : isLoading 
                ? "Searching..." 
                : `No results for "${searchTerm}"`
            }
          </h2>
        )}

        {isLoading && page === 1 ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : errorMessage ? (
          <p className="text-red-500 text-center py-8">{errorMessage}</p>
        ) : movieList.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {movieList.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </motion.div>
        ) : searchTerm ? (
          <p className="text-light-200 text-center py-8">No movies found for your search criteria</p>
        ) : null}
        
        {/* Load more indicator */}
        {!isLoading && movieList.length > 0 && page < totalPages && (
          <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-8">
            <div className="w-8 h-8 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Loading more indicator */}
        {isLoading && page > 1 && (
          <div className="flex justify-center mt-8">
            <Spinner />
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
