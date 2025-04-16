import Search from "./components/Search";
import { useState, useEffect, useRef } from "react";
import Spinner from "./components/Spinner";
import MovieCard from "./components/MovieCard";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_IMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasNewResults, setHasNewResults] = useState(false);

  const resultsRef = useRef(null);

  // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500ms
  useDebounce(
    () => {
      setDebouncedSearchTerm(searchTerm);
    },
    500,
    [searchTerm]
  );

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=vote_count.desc`;
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

      setMovieList(data.results || []);
      if (query && data.results.length > 0) {
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
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

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
  }
  , []);

  return (
    <main>
      <div className="pattern"></div>

      <div className="wrapper">
        <header>
          <img src="./hero.webp" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} isLoading={isLoading} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie , index) => (
                <li key={movie.$id}>
                  <p>{index+1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies" ref={resultsRef}>
          <h2>All Movies</h2>

          {isLoading && !searchTerm ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : movieList.length > 0 ? (
            <ul className={searchTerm ? 'search-results-highlight' : ''}>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          ) : searchTerm ? (
            <p className="text-light-200 text-center py-8">No movies found for your search criteria</p>
          ) : null}

          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        </section>
      </div>
    </main>
  );
};

export default App;
