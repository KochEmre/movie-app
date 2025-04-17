import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiBookmark, FiStar, FiClock, FiCalendar, FiPlay, FiArrowLeft } from 'react-icons/fi';
import { useFavorites } from '../contexts/FavoritesContext';
import { useWatchlist } from '../contexts/WatchlistContext';
import { getMovieDetails, getImageUrl, getBackdropUrl, getMovieVideos } from '../services/api';
import MovieSlider from './MovieSlider';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  useEffect(() => {
    const fetchMovieData = async () => {
      setIsLoading(true);
      try {
        const movieData = await getMovieDetails(id);
        if (!movieData) {
          throw new Error('Movie not found');
        }
        setMovie(movieData);
        
        // Fetch videos separately
        const videoData = await getMovieVideos(id);
        setVideos(videoData);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError(err.message || 'Failed to load movie details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();
    
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, [id]);

  const handleFavoriteClick = () => {
    if (isFavorite(movie.id)) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie);
    }
  };

  const handleWatchlistClick = () => {
    if (isInWatchlist(movie.id)) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  const getTrailerKey = () => {
    if (!videos || videos.length === 0) return null;
    
    // Try to find official trailer first
    const officialTrailer = videos.find(
      video => 
        video.type === 'Trailer' && 
        video.site === 'YouTube' &&
        video.name.toLowerCase().includes('official')
    );
    
    // If no official trailer, get any trailer
    const anyTrailer = videos.find(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    // If no trailer, get any video
    const anyVideo = videos.find(video => video.site === 'YouTube');
    
    return officialTrailer?.key || anyTrailer?.key || anyVideo?.key;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {error || 'Movie not found'}
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const {
    title,
    backdrop_path,
    poster_path,
    overview,
    vote_average,
    release_date,
    runtime,
    genres,
    credits,
    similar,
    recommendations,
  } = movie;

  const director = credits?.crew?.find(person => person.job === 'Director');
  const cast = credits?.cast?.slice(0, 10) || [];
  
  const trailerKey = getTrailerKey();

  return (
    <>
      {/* Hero section with backdrop */}
      <div className="relative w-full h-[70vh] overflow-hidden">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-30 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <FiArrowLeft size={24} />
        </button>
        
        {/* Background image with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-10" />
          {backdrop_path ? (
            <img
              src={getBackdropUrl(backdrop_path)}
              alt={title}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-gray-800"></div>
          )}
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
            {/* Poster */}
            <div className="hidden md:block w-64 rounded-lg overflow-hidden shadow-2xl transform translate-y-16">
              <img
                src={poster_path ? getImageUrl(poster_path) : 'https://via.placeholder.com/500x750?text=No+Image'}
                alt={title}
                className="w-full h-auto"
              />
            </div>
            
            {/* Movie info */}
            <div className="flex-1 pb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {title}
                {release_date && (
                  <span className="text-gray-400 text-2xl ml-2">
                    ({new Date(release_date).getFullYear()})
                  </span>
                )}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                {vote_average > 0 && (
                  <div className="flex items-center text-yellow-400">
                    <FiStar className="mr-1" />
                    <span>{vote_average.toFixed(1)}</span>
                  </div>
                )}
                
                {runtime > 0 && (
                  <div className="flex items-center text-gray-300">
                    <FiClock className="mr-1" />
                    <span>{Math.floor(runtime / 60)}h {runtime % 60}m</span>
                  </div>
                )}
                
                {release_date && (
                  <div className="flex items-center text-gray-300">
                    <FiCalendar className="mr-1" />
                    <span>{new Date(release_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              {genres && genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {genres.map(genre => (
                    <span 
                      key={genre.id}
                      className="px-3 py-1 bg-gray-800/80 text-gray-300 text-sm rounded-full"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap gap-3 mb-6">
                {trailerKey && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center transition-colors"
                  >
                    <FiPlay className="mr-2" />
                    Watch Trailer
                  </button>
                )}
                
                <button
                  onClick={handleFavoriteClick}
                  className={`px-6 py-3 rounded-full flex items-center transition-colors ${
                    isFavorite(movie.id)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800/80 text-white hover:bg-gray-700'
                  }`}
                >
                  {isFavorite(movie.id) ? (
                    <>
                      <FiHeart className="mr-2 fill-white" />
                      Remove from Favorites
                    </>
                  ) : (
                    <>
                      <FiHeart className="mr-2" />
                      Add to Favorites
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleWatchlistClick}
                  className={`px-6 py-3 rounded-full flex items-center transition-colors ${
                    isInWatchlist(movie.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800/80 text-white hover:bg-gray-700'
                  }`}
                >
                  {isInWatchlist(movie.id) ? (
                    <>
                      <FiBookmark className="mr-2 fill-white" />
                      Remove from Watchlist
                    </>
                  ) : (
                    <>
                      <FiBookmark className="mr-2" />
                      Add to Watchlist
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-gray-300 line-clamp-3 md:line-clamp-none">
                {overview}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="md:grid md:grid-cols-3 md:gap-12">
          {/* Poster for mobile */}
          <div className="md:hidden w-48 mx-auto mb-8 rounded-lg overflow-hidden shadow-lg">
            <img
              src={poster_path ? getImageUrl(poster_path) : 'https://via.placeholder.com/500x750?text=No+Image'}
              alt={title}
              className="w-full h-auto"
            />
          </div>
          
          {/* Left sidebar */}
          <div className="hidden md:block">
            <div className="sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Movie Info</h3>
              
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                {director && (
                  <div>
                    <h4 className="font-semibold">Director</h4>
                    <p>{director.name}</p>
                  </div>
                )}
                
                {cast.length > 0 && (
                  <div>
                    <h4 className="font-semibold">Cast</h4>
                    <ul className="space-y-1">
                      {cast.slice(0, 5).map(person => (
                        <li key={person.id}>{person.name}</li>
                      ))}
                      {cast.length > 5 && (
                        <li className="text-indigo-600 dark:text-indigo-400 cursor-pointer" onClick={() => setActiveTab('cast')}>
                          +{cast.length - 5} more
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                
                {movie.production_companies?.length > 0 && (
                  <div>
                    <h4 className="font-semibold">Production</h4>
                    <p>{movie.production_companies.map(c => c.name).join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="md:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('cast')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'cast'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Cast & Crew
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'videos'
                      ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Videos
                </button>
              </nav>
            </div>
            
            {/* Tab content */}
            <div className="mb-12">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Synopsis</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-8">
                    {overview || 'No overview available.'}
                  </p>
                  
                  {/* Movie details for mobile */}
                  <div className="md:hidden space-y-4 text-gray-700 dark:text-gray-300 mb-8">
                    {director && (
                      <div>
                        <h4 className="font-semibold">Director</h4>
                        <p>{director.name}</p>
                      </div>
                    )}
                    
                    {cast.length > 0 && (
                      <div>
                        <h4 className="font-semibold">Cast</h4>
                        <ul className="space-y-1">
                          {cast.slice(0, 5).map(person => (
                            <li key={person.id}>{person.name}</li>
                          ))}
                          {cast.length > 5 && (
                            <li className="text-indigo-600 dark:text-indigo-400 cursor-pointer" onClick={() => setActiveTab('cast')}>
                              +{cast.length - 5} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {activeTab === 'cast' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Cast</h3>
                  
                  {cast.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                      {cast.map(person => (
                        <div key={person.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
                          <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700">
                            {person.profile_path ? (
                              <img
                                src={getImageUrl(person.profile_path, 'w185')}
                                alt={person.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="font-medium text-gray-900 dark:text-white">{person.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{person.character}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">No cast information available.</p>
                  )}
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Crew</h3>
                  
                  {credits?.crew?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {credits.crew
                        .filter(person => ['Director', 'Producer', 'Screenplay', 'Writer'].includes(person.job))
                        .slice(0, 12)
                        .map(person => (
                          <div key={`${person.id}-${person.job}`} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                            <p className="font-medium text-gray-900 dark:text-white">{person.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{person.job}</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">No crew information available.</p>
                  )}
                </div>
              )}
              
              {activeTab === 'videos' && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Videos</h3>
                  
                  {videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {videos
                        .filter(video => video.site === 'YouTube')
                        .slice(0, 6)
                        .map(video => (
                          <div key={video.id} className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                            <iframe
                              src={`https://www.youtube.com/embed/${video.key}`}
                              title={video.name}
                              className="w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">No videos available.</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Similar movies */}
            {similar?.results?.length > 0 && (
              <MovieSlider
                title="Similar Movies"
                movies={similar.results}
                viewAllLink={`/similar/${id}`}
              />
            )}
            
            {/* Recommendations */}
            {recommendations?.results?.length > 0 && (
              <MovieSlider
                title="Recommended Movies"
                movies={recommendations.results}
                viewAllLink={`/recommendations/${id}`}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Trailer modal */}
      {showTrailer && trailerKey && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowTrailer(false)}
        >
          <button
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70"
            onClick={() => setShowTrailer(false)}
          >
            <FiX size={24} />
          </button>
          
          <div className="w-full max-w-4xl aspect-video" onClick={e => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="Trailer"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};

export default MovieDetail;
